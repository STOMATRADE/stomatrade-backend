import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { EthersProviderService } from './ethers-provider.service';
import { PlatformWalletService } from './platform-wallet.service';
import { TransactionService, TransactionResult } from './transaction.service';
import StomaTradeABI from '../abi/StomaTrade.json';
import { PrismaService } from 'src/prisma/prisma.service';
import { json } from 'stream/consumers';

export interface ProjectData {
  owner: string;
  valueProject: bigint;
  maxCrowdFunding: bigint;
  totalRaised: bigint;
  status: number;
  cid: string;
}

@Injectable()
export class StomaTradeContractService implements OnModuleInit {
  private readonly logger = new Logger(StomaTradeContractService.name);
  private contract: ethers.Contract;
  private stomatradeAddress: string;
  private stomatradeAbi: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly providerService: EthersProviderService,
    private readonly walletService: PlatformWalletService,
    private readonly transactionService: TransactionService,
    private readonly prisma: PrismaService
  ) {}

  async onModuleInit() {
    const project = await this.prisma.appProject.findFirst({
      where: {
        name: 'StomaTrade',
      },
    });


    if (!project?.contractAddress) {
      throw new Error('STOMA_TRADE_ADDRESS not found');
    }
    this.stomatradeAddress = project.contractAddress;

    if (!project?.abi) {
      throw new Error('STOMA_TRADE_ABI not found');
    }
    this.stomatradeAbi = JSON.parse(project.abi);


    const wallet = this.walletService.getWallet();
    this.contract = new ethers.Contract(
      this.stomatradeAddress,
      this.stomatradeAbi,
      wallet,
    );

    this.logger.log(
      `StomaTrade contract initialized at: ${this.stomatradeAddress}`,
    );
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

  /**
   * Get the signer address
   */
  async getSignerAddress(): Promise<string> {
    const runner = this.contract.runner;
    if (runner && 'getAddress' in runner) {
      return await (runner as ethers.Signer).getAddress();
    }
    return '';
  }

  // ============ WRITE FUNCTIONS ============

  /**
   * Create a new project on the blockchain
   */
  async createProject(
    valueProject: bigint,
    maxCrowdFunding: bigint,
    cid: string,
  ): Promise<TransactionResult> {
    this.logger.log('Creating project on blockchain');

    return await this.transactionService.executeContractMethod(
      this.contract,
      'createProject',
      [valueProject, maxCrowdFunding, cid],
    );
  }

  /**
   * Mint Farmer NFT (called by platform after approval)
   */
  async mintFarmerNFT(namaKomoditas: string): Promise<TransactionResult> {
    this.logger.log(`Minting Farmer NFT for commodity: ${namaKomoditas}`);

    return await this.transactionService.executeContractMethod(
      this.contract,
      'nftFarmer',
      [namaKomoditas],
    );
  }

  /**
   * Investor invests in a project
   * Note: This should be called by the investor's wallet, not the platform wallet
   */
  async invest(
    projectId: bigint,
    amount: bigint,
  ): Promise<TransactionResult> {
    this.logger.log(`Investing ${amount} in project ${projectId}`);

    return await this.transactionService.executeContractMethod(
      this.contract,
      'invest',
      [projectId, amount],
    );
  }

  /**
   * Admin deposits profit for a project
   */
  async depositProfit(
    projectId: bigint,
    amount: bigint,
  ): Promise<TransactionResult> {
    this.logger.log(`Depositing profit ${amount} for project ${projectId}`);

    return await this.transactionService.executeContractMethod(
      this.contract,
      'depositProfit',
      [projectId, amount],
    );
  }

  /**
   * Investor claims profit from a project
   * Note: This should be called by the investor's wallet, not the platform wallet
   */
  async claimProfit(projectId: bigint): Promise<TransactionResult> {
    this.logger.log(`Claiming profit for project ${projectId}`);

    return await this.transactionService.executeContractMethod(
      this.contract,
      'claimProfit',
      [projectId],
    );
  }

  /**
   * Admin marks project as refundable
   */
  async markRefundable(projectId: bigint): Promise<TransactionResult> {
    this.logger.log(`Marking project ${projectId} as refundable`);

    return await this.transactionService.executeContractMethod(
      this.contract,
      'refundable',
      [projectId],
    );
  }

  /**
   * Investor claims refund from a project
   * Note: This should be called by the investor's wallet, not the platform wallet
   */
  async claimRefund(projectId: bigint): Promise<TransactionResult> {
    this.logger.log(`Claiming refund for project ${projectId}`);

    return await this.transactionService.executeContractMethod(
      this.contract,
      'claimRefund',
      [projectId],
    );
  }

  /**
   * Close crowdfunding for a project
   */
  async closeCrowdFunding(projectId: bigint): Promise<TransactionResult> {
    this.logger.log(`Closing crowdfunding for project ${projectId}`);

    return await this.transactionService.executeContractMethod(
      this.contract,
      'closeCrowdFunding',
      [projectId],
    );
  }

  // ============ READ FUNCTIONS ============

  /**
   * Get project data
   */
  async getProject(projectId: bigint): Promise<ProjectData> {
    this.logger.log(`Getting project ${projectId} data`);

    const result = await this.transactionService.callContractMethod(
      this.contract,
      'getProject',
      [projectId],
    );

    return {
      owner: result.owner,
      valueProject: result.valueProject,
      maxCrowdFunding: result.maxCrowdFunding,
      totalRaised: result.totalRaised,
      status: result.status,
      cid: result.cid,
    };
  }

  /**
   * Get investor contribution to a project
   */
  async getContribution(
    projectId: bigint,
    investor: string,
  ): Promise<bigint> {
    this.logger.log(`Getting contribution for project ${projectId} from ${investor}`);

    return await this.transactionService.callContractMethod(
      this.contract,
      'getContribution',
      [projectId, investor],
    );
  }

  /**
   * Get profit pool for a project
   */
  async getProfitPool(projectId: bigint): Promise<bigint> {
    this.logger.log(`Getting profit pool for project ${projectId}`);

    return await this.transactionService.callContractMethod(
      this.contract,
      'getProfitPool',
      [projectId],
    );
  }

  /**
   * Get claimed profit by an investor
   */
  async getClaimedProfit(
    projectId: bigint,
    investor: string,
  ): Promise<bigint> {
    this.logger.log(`Getting claimed profit for project ${projectId} from ${investor}`);

    return await this.transactionService.callContractMethod(
      this.contract,
      'getClaimedProfit',
      [projectId, investor],
    );
  }

  /**
   * Get token URI for an NFT
   */
  async getTokenURI(tokenId: bigint): Promise<string> {
    this.logger.log(`Getting token URI for token ${tokenId}`);

    return await this.transactionService.callContractMethod(
      this.contract,
      'tokenURI',
      [tokenId],
    );
  }

  // ============ EVENT PARSING ============

  /**
   * Parse event logs from transaction receipt
   */
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
      } catch (error) {
        // Ignore logs that can't be parsed (may be from other contracts)
      }
    }

    return parsedLogs;
  }

  /**
   * Get specific event from transaction receipt
   */
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
