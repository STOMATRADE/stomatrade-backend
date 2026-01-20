import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
import { EthersProviderService } from './ethers-provider.service';
import { PlatformWalletService } from './platform-wallet.service';
import { TransactionService, TransactionResult } from './transaction.service';
import { PrismaService } from 'src/prisma/prisma.service';

export interface ProjectData {
  id: bigint;
  idToken: bigint;
  valueProject: bigint;
  maxInvested: bigint;
  totalRaised: bigint;
  totalKilos: bigint;
  profitPerKillos: bigint;
  sharedProfit: bigint;
  status: number;
}

export interface ContributionData {
  id: bigint;
  idToken: bigint;
  idProject: bigint;
  investor: string;
  amount: bigint;
  status: number;
}

export interface AdminRequiredDeposit {
  totalPrincipal: bigint;
  totalInvestorProfit: bigint;
  totalRequired: bigint;
}

export interface InvestorReturn {
  principal: bigint;
  profit: bigint;
  totalReturn: bigint;
}

export interface ProjectProfitBreakdown {
  grossProfit: bigint;
  investorProfitPool: bigint;
  platformProfit: bigint;
}

@Injectable()
export class StomaTradeContractService implements OnModuleInit {
  private readonly logger = new Logger(StomaTradeContractService.name);
  private contract: ethers.Contract;
  private stomatradeAddress: string;
  private stomatradeAbi: any;
  private idrxTokenAddress: string;
  private idrxTokenAbi: any;
  private chainId: number;

  constructor(
    private readonly providerService: EthersProviderService,
    private readonly walletService: PlatformWalletService,
    private readonly transactionService: TransactionService,
    private readonly prisma: PrismaService
  ) {}

  async onModuleInit() {
    const project = await this.prisma.appProject.findFirst({
      where: {
        name: 'StomaTrade',
        deleted: false,
      },
    });

    if (!project) {
      throw new Error(
        'Active StomaTrade AppProject configuration not found in database. Please ensure AppProject is configured and not deleted.',
      );
    }

    if (!project.contractAddress) {
      throw new Error(
        'Contract address not found in StomaTrade AppProject configuration',
      );
    }
    this.stomatradeAddress = project.contractAddress;

    if (!project.abi) {
      throw new Error('ABI not found in StomaTrade AppProject configuration');
    }
    this.stomatradeAbi = JSON.parse(project.abi.replace(/\\"/g, '"'));

    const idrxProject = await this.prisma.appProject.findFirst({
      where: {
        name: 'IDRXTOKEN',
        deleted: false,
      },
    });

    if (!idrxProject) {
      throw new Error(
        'IDRXTOKEN AppProject configuration not found in database. Please ensure IDRXTOKEN record is created in AppProject table.',
      );
    }

    if (!idrxProject.contractAddress) {
      throw new Error(
        'Contract address not found in IDRXTOKEN AppProject configuration',
      );
    }
    this.idrxTokenAddress = idrxProject.contractAddress;

    if (idrxProject.abi) {
      this.idrxTokenAbi = JSON.parse(idrxProject.abi.replace(/\\"/g, '"'));
    }

    if (project.chainId) {
      const chainIdMatch = project.chainId.match(/eip155:(\d+)/);
      if (chainIdMatch) {
        this.chainId = parseInt(chainIdMatch[1], 10);
      }
    }

    await this.walletService.waitForInit();

    const wallet = this.walletService.getWallet();
    this.contract = new ethers.Contract(
      this.stomatradeAddress,
      this.stomatradeAbi,
      wallet,
    );

    this.logger.log(
      `StomaTrade contract initialized at: ${this.stomatradeAddress}`,
    );
    this.logger.log(`IDRX token address: ${this.idrxTokenAddress}`);
    this.logger.log(`Chain ID: ${this.chainId}`);
  }

  getContract(): ethers.Contract {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    return this.contract;
  }

  getstomatradeAddress(): string {
    return this.stomatradeAddress;
  }

  encodeFunctionData(functionName: string, args: unknown[]): string {
    const contract = this.getContract();
    return contract.interface.encodeFunctionData(functionName, args);
  }

  private extractCID(url: string): string {
    if (!url) return '';

    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', '');
    }

    const match = url.match(/\/ipfs\/([a-zA-Z0-9]+)/);
    if (match) {
      return match[1];
    }

    return url;
  }

  getCreateProjectCalldata(
    cid: string,
    valueProject: string | bigint,
    maxInvested: string | bigint,
    totalKilos: string | bigint,
    profitPerKillos: string | bigint,
    sharedProfit: number | bigint,
  ): string {
    return this.encodeFunctionData('createProject', [
      cid,
      valueProject,
      maxInvested,
      totalKilos,
      profitPerKillos,
      sharedProfit,
    ]);
  }

  getMintFarmerCalldata(
    cid: string,
    idCollector: string,
    name: string,
    age: number | bigint,
    domicile: string,
  ): string {
    return this.encodeFunctionData('addFarmer', [
      cid,
      idCollector,
      name,
      age,
      domicile,
    ]);
  }

  async getSignerAddress(): Promise<string> {
    const runner = this.contract.runner;
    if (runner && 'getAddress' in runner) {
      return await (runner as ethers.Signer).getAddress();
    }
    return '';
  }

  async createProject(
    cid: string,
    valueProject: bigint,
    maxInvested: bigint,
    totalKilos: bigint,
    profitPerKillos: bigint,
    sharedProfit: bigint,
  ): Promise<TransactionResult> {
    this.logger.log('Creating project on blockchain');

    return await this.transactionService.executeContractMethod(
      this.contract,
      'createProject',
      [cid, valueProject, maxInvested, totalKilos, profitPerKillos, sharedProfit],
    );
  }

  async addFarmer(
    cid: string,
    idCollector: string,
    name: string,
    age: bigint,
    domicile: string,
  ): Promise<TransactionResult> {
    this.logger.log(`Adding Farmer NFT: ${name}`);

    return await this.transactionService.executeContractMethod(
      this.contract,
      'addFarmer',
      [cid, idCollector, name, age, domicile],
    );
  }

  async invest(
    cid: string,
    projectId: bigint,
    amount: bigint,
  ): Promise<TransactionResult> {
    this.logger.log(`Investing ${amount} in project ${projectId}`);

    return await this.transactionService.executeContractMethod(
      this.contract,
      'invest',
      [cid, projectId, amount],
    );
  }

  async withdrawProject(projectId: bigint): Promise<TransactionResult> {
    this.logger.log(`Withdrawing project ${projectId} funds`);

    return await this.transactionService.executeContractMethod(
      this.contract,
      'withdrawProject',
      [projectId],
    );
  }

  async claimWithdraw(projectId: bigint): Promise<TransactionResult> {
    this.logger.log(`Claiming withdraw for project ${projectId}`);

    return await this.transactionService.executeContractMethod(
      this.contract,
      'claimWithdraw',
      [projectId],
    );
  }

  async refundProject(projectId: bigint): Promise<TransactionResult> {
    this.logger.log(`Marking project ${projectId} for refund`);

    return await this.transactionService.executeContractMethod(
      this.contract,
      'refundProject',
      [projectId],
    );
  }

  async claimRefund(projectId: bigint): Promise<TransactionResult> {
    this.logger.log(`Claiming refund for project ${projectId}`);

    return await this.transactionService.executeContractMethod(
      this.contract,
      'claimRefund',
      [projectId],
    );
  }

  async closeProject(projectId: bigint): Promise<TransactionResult> {
    this.logger.log(`Closing project ${projectId}`);

    return await this.transactionService.executeContractMethod(
      this.contract,
      'closeProject',
      [projectId],
    );
  }

  async finishProject(projectId: bigint): Promise<TransactionResult> {
    this.logger.log(`Finishing project ${projectId}`);

    return await this.transactionService.executeContractMethod(
      this.contract,
      'finishProject',
      [projectId],
    );
  }

  async getProject(projectId: bigint): Promise<ProjectData> {
    this.logger.log(`Getting project ${projectId} data`);

    const result = await this.transactionService.callContractMethod(
      this.contract,
      'projects',
      [projectId],
    );

    return {
      id: result.id,
      idToken: result.idToken,
      valueProject: result.valueProject,
      maxInvested: result.maxInvested,
      totalRaised: result.totalRaised,
      totalKilos: result.totalKilos,
      profitPerKillos: result.profitPerKillos,
      sharedProfit: result.sharedProfit,
      status: result.status,
    };
  }

  async getContribution(
    projectId: bigint,
    investor: string,
  ): Promise<ContributionData> {
    this.logger.log(`Getting contribution for project ${projectId} from ${investor}`);

    const result = await this.transactionService.callContractMethod(
      this.contract,
      'contribution',
      [projectId, investor],
    );

    return {
      id: result.id,
      idToken: result.idToken,
      idProject: result.idProject,
      investor: result.investor,
      amount: result.amount,
      status: result.status,
    };
  }

  async getAdminRequiredDeposit(projectId: bigint): Promise<AdminRequiredDeposit> {
    this.logger.log(`Getting admin required deposit for project ${projectId}`);

    const result = await this.transactionService.callContractMethod(
      this.contract,
      'getAdminRequiredDeposit',
      [projectId],
    );

    return {
      totalPrincipal: result.totalPrincipal,
      totalInvestorProfit: result.totalInvestorProfit,
      totalRequired: result.totalRequired,
    };
  }

  async getInvestorReturn(
    projectId: bigint,
    investor: string,
  ): Promise<InvestorReturn> {
    this.logger.log(`Getting investor return for project ${projectId} investor ${investor}`);

    const result = await this.transactionService.callContractMethod(
      this.contract,
      'getInvestorReturn',
      [projectId, investor],
    );

    return {
      principal: result.principal,
      profit: result.profit,
      totalReturn: result.totalReturn,
    };
  }

  async getProjectProfitBreakdown(projectId: bigint): Promise<ProjectProfitBreakdown> {
    this.logger.log(`Getting profit breakdown for project ${projectId}`);

    const result = await this.transactionService.callContractMethod(
      this.contract,
      'getProjectProfitBreakdown',
      [projectId],
    );

    return {
      grossProfit: result.grossProfit,
      investorProfitPool: result.investorProfitPool,
      platformProfit: result.platformProfit,
    };
  }

  async getTokenURI(tokenId: bigint): Promise<string> {
    this.logger.log(`Getting token URI for token ${tokenId}`);

    return await this.transactionService.callContractMethod(
      this.contract,
      'tokenURI',
      [tokenId],
    );
  }

  async depositProfit(projectId: bigint, _amount?: bigint): Promise<TransactionResult> {
    this.logger.warn('depositProfit() is deprecated, use withdrawProject() instead');
    return this.withdrawProject(projectId);
  }

  async claimProfit(projectId: bigint): Promise<TransactionResult> {
    this.logger.warn('claimProfit() is deprecated, use claimWithdraw() instead');
    return this.claimWithdraw(projectId);
  }

  async markRefundable(projectId: bigint): Promise<TransactionResult> {
    this.logger.warn('markRefundable() is deprecated, use refundProject() instead');
    return this.refundProject(projectId);
  }

  async closeCrowdFunding(projectId: bigint): Promise<TransactionResult> {
    this.logger.warn('closeCrowdFunding() is deprecated, use closeProject() instead');
    return this.closeProject(projectId);
  }

  async getProfitPool(_projectId: bigint): Promise<bigint> {
    this.logger.warn('getProfitPool() is deprecated and not available in contract');
    throw new Error('getProfitPool() is not available. Use getProjectProfitBreakdown() instead');
  }

  async getClaimedProfit(_projectId: bigint, _investor: string): Promise<bigint> {
    this.logger.warn('getClaimedProfit() is deprecated and not available in contract');
    throw new Error('getClaimedProfit() is not available. Use getInvestorReturn() instead');
  }

  encodeApproveData(spenderAddress: string, amount: bigint): string {
    const erc20Interface = new ethers.Interface([
      'function approve(address spender, uint256 amount) returns (bool)',
    ]);
    return erc20Interface.encodeFunctionData('approve', [spenderAddress, amount]);
  }

  encodeInvestData(cid: string, projectId: bigint, amount: bigint): string {
    return this.encodeFunctionData('invest', [cid, projectId, amount]);
  }

  getStomaTradeAddress(): string {
    return this.stomatradeAddress;
  }

  getIdrxTokenAddress(): string {
    return this.idrxTokenAddress;
  }

  getChainId(): number {
    return this.chainId;
  }

  parseEventLogs(receipt: ethers.TransactionReceipt): ethers.EventLog[] {
    const parsedLogs: ethers.EventLog[] = [];

    for (const log of receipt.logs) {
      try {
        const parsed = this.contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });

        if (parsed) {
          parsedLogs.push(log as ethers.EventLog);
        }
      } catch (error) {}
    }

    return parsedLogs;
  }

  getEventFromReceipt(
    receipt: ethers.TransactionReceipt,
    eventName: string,
  ): ethers.EventLog | null {
    const parsedLogs = this.parseEventLogs(receipt);

    for (const log of parsedLogs) {
      const parsed = this.contract.interface.parseLog({
        topics: log.topics,
        data: log.data,
      });

      if (parsed && parsed.name === eventName) {
        return log;
      }
    }

    return null;
  }
}
