import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { EthersProviderService } from './ethers-provider.service';
import { PlatformWalletService } from './platform-wallet.service';
import { TransactionService, TransactionResult } from './transaction.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StomaTradeContractService implements OnModuleInit {
  private readonly logger = new Logger(StomaTradeContractService.name);
  private contracts: Map<number, ethers.Contract> = new Map();
  private readonly DEFAULT_CHAIN_NAME = 'StomaTrade';

  constructor(
    private readonly configService: ConfigService,
    private readonly providerService: EthersProviderService,
    private readonly walletService: PlatformWalletService,
    private readonly transactionService: TransactionService,
    private readonly prisma: PrismaService
  ) { }

  async onModuleInit() {
    this.logger.log('StomaTradeContractService initialized. Ready to handle multi-chain requests.');
  }

  /**
   * Resolve contract instance for a specific chain ID
   */
  async getContract(chainId: number): Promise<ethers.Contract> {
    if (this.contracts.has(chainId)) {
      return this.contracts.get(chainId)!;
    }

    this.logger.log(`Initializing contract for Chain ID: ${chainId}`);

    const smartContract = await this.prisma.smartContract.findFirst({
      where: {
        name: this.DEFAULT_CHAIN_NAME,
        chainId: chainId.toString(),
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!smartContract) {
      throw new Error(`Smart Contract config not found for Chain ID: ${chainId}`);
    }

    if (!smartContract.contractAddress || !smartContract.abi) {
      throw new Error(`Invalid Smart Contract config for Chain ID: ${chainId}`);
    }

    const abi = JSON.parse(smartContract.abi.replace(/\\"/g, '"'));

    // Determine Provider
    let provider = this.providerService.getProvider();
    if (smartContract.rpcUrl) {
      // Create dedicated provider for this chain
      provider = this.providerService.createProviderFromUrl(smartContract.rpcUrl, chainId);
    }

    // Determine Signer
    const privateKey = this.configService.get<string>('PLATFORM_WALLET_PRIVATE_KEY');
    if (!privateKey) {
      throw new Error('PLATFORM_WALLET_PRIVATE_KEY is not configured');
    }
    const signer = new ethers.Wallet(privateKey, provider);

    const contract = new ethers.Contract(
      smartContract.contractAddress,
      abi,
      signer,
    );

    this.contracts.set(chainId, contract);
    return contract;
  }

  /**
   * Get default contract (useful for non-chain-specific reads if fallback needed)
   */
  async getDefaultContract(): Promise<ethers.Contract> {
    const defaultChainId = this.providerService.getChainId();
    return this.getContract(defaultChainId);
  }

  async getContractInstance(chainId?: number): Promise<ethers.Contract> {
    if (chainId) {
      return this.getContract(chainId);
    }
    return this.getDefaultContract();
  }

  getstomatradeAddress(): string {
    // This is ambiguous in multi-chain context, but kept for compatibility.
    // Ideally should be deprecated or accept chainId
    return '';
  }

  /**
   * Encode raw calldata for a contract function using the loaded ABI.
   * Useful for frontends that need hex data without sending a transaction.
   */
  async encodeFunctionData(functionName: string, args: unknown[]): Promise<string> {
    const contract = await this.getDefaultContract();
    return contract.interface.encodeFunctionData(functionName, args);
  }

  async getCreateProjectCalldata(
    valueProject: string | bigint,
    maxCrowdFunding: string | bigint,
    totalKilos: string | bigint,
    profitPerKillos: string | bigint,
    sharedProfit: string | bigint,
    cid: string,
  ): Promise<string> {
    return this.encodeFunctionData('createProject', [
      cid,
      valueProject,
      maxCrowdFunding,
      totalKilos,
      profitPerKillos,
      sharedProfit,
    ]);
  }

  async getAddFarmerCalldata(
    cid: string,
    idCollector: string,
    name: string,
    age: number | string,
    domicile: string,
  ): Promise<string> {
    return this.encodeFunctionData('addFarmer', [
      cid,
      idCollector,
      name,
      age,
      domicile,
    ]);
  }

  /**
   * Get the signer address
   */
  async getSignerAddress(): Promise<string> {
    return this.walletService.getAddress();
  }

  // ============ WRITE FUNCTIONS ============

  /**
   * Create a new project on the blockchain
   */
  async createProject(
    chainId: number,
    valueProject: bigint,
    maxCrowdFunding: bigint,
    totalKilos: bigint,
    profitPerKillos: bigint,
    sharedProfit: bigint,
    cid: string,
  ): Promise<TransactionResult> {
    this.logger.log(`Creating project on blockchain (Chain ${chainId})`);

    const contract = await this.getContract(chainId);

    return await this.transactionService.executeContractMethod(
      contract,
      'createProject',
      [cid, valueProject, maxCrowdFunding, totalKilos, profitPerKillos, sharedProfit],
    );
  }

  /**
   * Add Farmer (Mint Farmer NFT)
   */
  async addFarmer(
    chainId: number,
    cid: string,
    idCollector: string,
    name: string,
    age: number,
    domicile: string,
  ): Promise<TransactionResult> {
    this.logger.log(`Adding farmer: ${name} (${idCollector}) on Chain ${chainId}`);

    const contract = await this.getContract(chainId);

    return await this.transactionService.executeContractMethod(
      contract,
      'addFarmer',
      [cid, idCollector, name, age, domicile],
    );
  }

  /**
   * Investor invests in a project
   * Note: This should be called by the investor's wallet, not the platform wallet
   */
  async invest(
    chainId: number,
    cid: string,
    projectId: bigint,
    amount: bigint,
  ): Promise<TransactionResult> {
    this.logger.log(`Investing ${amount} in project ${projectId} on Chain ${chainId}`);

    const contract = await this.getContract(chainId);

    return await this.transactionService.executeContractMethod(
      contract,
      'invest',
      [cid, projectId, amount],
    );
  }

  /**
   * Admin finishes project (deposits profit implicitly via transferFrom)
   */
  async finishProject(
    chainId: number,
    projectId: bigint,
  ): Promise<TransactionResult> {
    this.logger.log(`Finishing project ${projectId} on Chain ${chainId}`);

    const contract = await this.getContract(chainId);

    return await this.transactionService.executeContractMethod(
      contract,
      'finishProject',
      [projectId],
    );
  }

  /**
   * Investor claims return (profit + principal) from a project
   * Note: This should be called by the investor's wallet, not the platform wallet
   */
  async claimWithdraw(chainId: number, projectId: bigint): Promise<TransactionResult> {
    this.logger.log(`Claiming withdrawal for project ${projectId} on Chain ${chainId}`);

    const contract = await this.getContract(chainId);

    return await this.transactionService.executeContractMethod(
      contract,
      'claimWithdraw',
      [projectId],
    );
  }

  /**
   * Admin marks project as refundable (refundProject)
   */
  async refundProject(chainId: number, projectId: bigint): Promise<TransactionResult> {
    this.logger.log(`Marking project ${projectId} as refundable on Chain ${chainId}`);

    const contract = await this.getContract(chainId);

    return await this.transactionService.executeContractMethod(
      contract,
      'refundProject',
      [projectId],
    );
  }

  /**
   * Investor claims refund from a project
   * Note: This should be called by the investor's wallet, not the platform wallet
   */
  async claimRefund(chainId: number, projectId: bigint): Promise<TransactionResult> {
    this.logger.log(`Claiming refund for project ${projectId} on Chain ${chainId}`);

    const contract = await this.getContract(chainId);

    return await this.transactionService.executeContractMethod(
      contract,
      'claimRefund',
      [projectId],
    );
  }

  /**
   * Close project (before funding / after funding if needed?)
   * Note: closeProject exists in contract
   */
  async closeProject(chainId: number, projectId: bigint): Promise<TransactionResult> {
    this.logger.log(`Closing project ${projectId} on Chain ${chainId}`);

    const contract = await this.getContract(chainId);

    return await this.transactionService.executeContractMethod(
      contract,
      'closeProject',
      [projectId],
    );
  }

  // ============ READ FUNCTIONS ============

  /**
   * Get claimed profit by an investor
   */
  async getClaimedProfit(
    chainId: number,
    projectId: bigint,
    investor: string,
  ): Promise<bigint> {
    this.logger.log(`Getting claimed profit for project ${projectId} from ${investor} on Chain ${chainId}`);

    const contract = await this.getContract(chainId);

    return await this.transactionService.callContractMethod(
      contract,
      'getClaimedProfit',
      [projectId, investor],
    );
  }

  /**
   * Get token URI for an NFT
   */
  async getTokenURI(chainId: number, tokenId: bigint): Promise<string> {
    this.logger.log(`Getting token URI for token ${tokenId} on Chain ${chainId}`);

    const contract = await this.getContract(chainId);

    return await this.transactionService.callContractMethod(
      contract,
      'tokenURI',
      [tokenId],
    );
  }

  // ============ EVENT PARSING ============

  /**
   * Parse event logs from transaction receipt
   */
  async parseEventLogs(chainId: number, receipt: ethers.TransactionReceipt): Promise<ethers.EventLog[]> {
    const contract = await this.getContract(chainId);
    const parsedLogs: ethers.EventLog[] = [];

    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });

        if (parsed) {
          parsedLogs.push(log as ethers.EventLog);
        }
      } catch (error) {
        // Ignore logs that can't be parsed (may be from other contracts)
      }
    }

    return parsedLogs;
  }

  /**
   * Get specific event from transaction receipt
   */
  async getEventFromReceipt(
    chainId: number,
    receipt: ethers.TransactionReceipt,
    eventName: string,
  ): Promise<ethers.EventLog | null> {
    const parsedLogs = await this.parseEventLogs(chainId, receipt);

    // We need interface to compare names, so get contract again or reuse if possible
    // parsedLogs contains filtered logs already so iterating them is fine
    // But to check name we need the parsed result which we lost in loop above?
    // Wait, log as ethers.EventLog casting might not be enough if we don't attach the parsed description?
    // ethers.EventLog has fragment/name properties.
    // Let's re-parse properly.

    const contract = await this.getContract(chainId);

    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        if (parsed && parsed.name === eventName) {
          // Return a structure compatible with what caller expects (often the log with args attached)
          // In ethers v6, parseLog returns LogDescription.
          // We might need to map it.
          // For now, let's trust the caller handles the return type which seems to be EventLog | null

          // Let's try to return the log but enriched? 
          // Or just return the parsed description? 
          // The previous code returned `log` if parsed.name matched.

          return {
            ...log,
            args: parsed.args,
            fragment: parsed.fragment,
            name: parsed.name,
            signature: parsed.signature,
            topic: parsed.topic
          } as any;
        }
      } catch (e) { }
    }

    return null;
  }
}
