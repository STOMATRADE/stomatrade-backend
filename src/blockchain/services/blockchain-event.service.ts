import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ethers, EventLog, Log } from 'ethers';
import { EthersProviderService } from './ethers-provider.service';
import { StomaTradeContractService } from './stomatrade-contract.service';

export interface BlockchainEvent {
  eventName: string;
  blockNumber: number;
  transactionHash: string;
  args: any;
  timestamp: number;
}

@Injectable()
export class BlockchainEventService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainEventService.name);
  private isListening = false;

  constructor(
    private readonly providerService: EthersProviderService,
    private readonly contractService: StomaTradeContractService,
  ) { }

  async onModuleInit() {
    // We'll start event listening manually when needed
    this.logger.log('Blockchain Event Service initialized');
  }

  /**
   * Start listening to all contract events
   */
  startListening() {
    if (this.isListening) {
      this.logger.warn('Already listening to events');
      return;
    }

    const contract = this.contractService.getContract();

    // Listen to ProjectCreated events
    contract.on('ProjectCreated', async (idProject, owner, valueProject, maxCrowdFunding, event) => {
      await this.handleProjectCreatedEvent({
        idProject,
        owner,
        valueProject,
        maxCrowdFunding,
        event,
      });
    });

    // Listen to FarmerMinted events
    contract.on('FarmerMinted', async (farmer, nftId, namaKomoditas, event) => {
      await this.handleFarmerMintedEvent({
        farmer,
        nftId,
        namaKomoditas,
        event,
      });
    });

    // Listen to Invested events
    contract.on('Invested', async (idProject, investor, amount, receiptTokenId, event) => {
      await this.handleInvestedEvent({
        idProject,
        investor,
        amount,
        receiptTokenId,
        event,
      });
    });

    // Listen to ProfitDeposited events
    contract.on('ProfitDeposited', async (idProject, amount, event) => {
      await this.handleProfitDepositedEvent({
        idProject,
        amount,
        event,
      });
    });

    // Listen to ProfitClaimed events
    contract.on('ProfitClaimed', async (idProject, user, amount, event) => {
      await this.handleProfitClaimedEvent({
        idProject,
        user,
        amount,
        event,
      });
    });

    // Listen to Refunded events
    contract.on('Refunded', async (idProject, investor, amount, event) => {
      await this.handleRefundedEvent({
        idProject,
        investor,
        amount,
        event,
      });
    });

    this.isListening = true;
    this.logger.log('Started listening to blockchain events');
  }

  /**
   * Stop listening to events
   */
  stopListening() {
    const contract = this.contractService.getContract();
    contract.removeAllListeners();
    this.isListening = false;
    this.logger.log('Stopped listening to blockchain events');
  }

  /**
   * Query past events in a block range
   */
  async queryPastEvents(
    eventName: string,
    fromBlock: number,
    toBlock: number | 'latest' = 'latest',
  ): Promise<BlockchainEvent[]> {
    this.logger.log(
      `Querying past ${eventName} events from block ${fromBlock} to ${toBlock}`,
    );

    const contract = this.contractService.getContract();
    const filter = contract.filters[eventName]();

    const events = await contract.queryFilter(filter, fromBlock, toBlock);

    const blockchainEvents: BlockchainEvent[] = [];

    for (const event of events) {
      const block = await event.getBlock();

      blockchainEvents.push({
        eventName: (event as EventLog).eventName || eventName,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        args: (event as EventLog).args,
        timestamp: block.timestamp,
      });
    }

    this.logger.log(`Found ${blockchainEvents.length} past ${eventName} events`);
    return blockchainEvents;
  }

  /**
   * Sync events from a specific block to current
   */
  async syncEventsFromBlock(fromBlock: number): Promise<void> {
    this.logger.log(`Syncing events from block ${fromBlock}`);

    const currentBlock = await this.providerService.getBlockNumber();

    // Query all event types
    const eventTypes = [
      'ProjectCreated',
      'FarmerAdded', // Changed from FarmerMinted in new contract
      'Invested',
      'ProfitDeposited',
      'ProfitClaimed',
      'Refunded',
    ];

    for (const eventType of eventTypes) {
      try {
        const events = await this.queryPastEvents(
          eventType,
          fromBlock,
          currentBlock,
        );

        // Process events based on type
        for (const event of events) {
          await this.processHistoricalEvent(event);
        }
      } catch (error) {
        this.logger.error(`Error syncing ${eventType} events`, error);
      }
    }

    this.logger.log(`Event sync completed up to block ${currentBlock}`);
  }

  // ============ EVENT HANDLERS ============

  private async handleProjectCreatedEvent(data: any) {
    this.logger.log(
      `ProjectCreated event: Project ${data.idProject} created by ${data.owner}`,
    );

    // TODO: Store event in database
    // You'll implement this when we create the database module
  }

  private async handleFarmerMintedEvent(data: any) {
    this.logger.log(
      `FarmerMinted event: Farmer ${data.farmer} minted NFT ${data.nftId}`,
    );

    // TODO: Store event in database and update farmer record
  }

  private async handleInvestedEvent(data: any) {
    this.logger.log(
      `Invested event: ${data.investor} invested ${data.amount} in project ${data.idProject}`,
    );

    // TODO: Store investment in database
  }

  private async handleProfitDepositedEvent(data: any) {
    this.logger.log(
      `ProfitDeposited event: ${data.amount} deposited to project ${data.idProject}`,
    );

    // TODO: Update profit pool in database
  }

  private async handleProfitClaimedEvent(data: any) {
    this.logger.log(
      `ProfitClaimed event: ${data.user} claimed ${data.amount} from project ${data.idProject}`,
    );

    // TODO: Update profit claim in database
  }

  private async handleRefundedEvent(data: any) {
    this.logger.log(
      `Refunded event: ${data.investor} refunded ${data.amount} from project ${data.idProject}`,
    );

    // TODO: Update refund in database
  }

  private async processHistoricalEvent(event: BlockchainEvent) {
    this.logger.debug(
      `Processing historical ${event.eventName} event from block ${event.blockNumber}`,
    );

    // TODO: Process historical events and update database
  }
}
