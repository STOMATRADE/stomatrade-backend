import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ethers, EventLog, Log } from 'ethers';
import { EthersProviderService } from './ethers-provider.service';
import { StomaTradeContractService } from './stomatrade-contract.service';
import { PrismaService } from '../../prisma/prisma.service';

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
    private readonly prisma: PrismaService,
  ) { }

  async onModuleInit() {
    // We'll start event listening manually when needed
    this.logger.log('Blockchain Event Service initialized');
  }

  /**
   * Start listening to all contract events
   */
  async startListening() {
    if (this.isListening) {
      this.logger.warn('Already listening to events');
      return;
    }

    const smartContracts = await this.prisma.smartContract.findMany({
      where: { deleted: false },
    });

    for (const sc of smartContracts) {
      try {
        const chainId = parseInt(sc.chainId, 10);
        if (isNaN(chainId)) {
          this.logger.warn(`Invalid chainId for contract ${sc.name}: ${sc.chainId}`);
          continue;
        }

        const contract = await this.contractService.getContract(chainId);

        this.logger.log(`Setting up listeners for chain ${chainId}`);

        // Listen to ProjectCreated events
        contract.on('ProjectCreated', async (idProject, owner, valueProject, maxInvested, event) => {
          await this.handleProjectCreatedEvent({
            idProject,
            owner,
            valueProject,
            maxInvested,
            event,
            chainId,
          });
        });

        // Listen to FarmerAdded events
        contract.on('FarmerAdded', async (idFarmer, idCollector, event) => {
          await this.handleFarmerAddedEvent({
            idFarmer,
            idCollector,
            event,
            chainId,
          });
        });

        // Listen to Invested events
        contract.on('Invested', async (idProject, investor, amount, idToken, event) => {
          await this.handleInvestedEvent({
            idProject,
            investor,
            amount,
            idToken,
            event,
            chainId,
          });
        });

        // Listen to ProjectStatusChanged events (covers closed, finished, refunded)
        contract.on('ProjectStatusChanged', async (idProject, oldStatus, newStatus, event) => {
          await this.handleProjectStatusChangedEvent({
            idProject,
            oldStatus,
            newStatus,
            event,
            chainId,
          });
        });

        // Listen to ProfitClaimed events
        contract.on('ProfitClaimed', async (idProject, user, amount, event) => {
          await this.handleProfitClaimedEvent({
            idProject,
            user,
            amount,
            event,
            chainId,
          });
        });

        // Listen to Refunded events
        contract.on('Refunded', async (idProject, investor, amount, event) => {
          await this.handleRefundedEvent({
            idProject,
            investor,
            amount,
            event,
            chainId,
          });
        });

      } catch (error) {
        this.logger.error(`Failed to setup listeners for chain ${sc.chainId}`, error);
      }
    }

    this.isListening = true;
    this.logger.log('Started listening to blockchain events on all chains');
  }

  /**
   * Stop listening to events
   */
  async stopListening() {
    const smartContracts = await this.prisma.smartContract.findMany({
      where: { deleted: false },
    });

    for (const sc of smartContracts) {
      try {
        const chainId = parseInt(sc.chainId, 10);
        if (!isNaN(chainId)) {
          const contract = await this.contractService.getContract(chainId);
          contract.removeAllListeners();
        }
      } catch (error) {
        // Ignore errors during cleanup
      }
    }

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

    // For now defaulting to chainId 0 or we need to pass chainId to queryPastEvents
    // This part requires API update to support chain specific queries, 
    // but for build fix I'll assume a default or require update.
    // However, better to just log or throw not implemented if chainId missing.
    // Or iterate all chains.

    // Simplification: query all chains
    const blockchainEvents: BlockchainEvent[] = [];
    const smartContracts = await this.prisma.smartContract.findMany({ where: { deleted: false } });

    for (const sc of smartContracts) {
      const chainId = parseInt(sc.chainId, 10);
      if (isNaN(chainId)) continue;

      const contract = await this.contractService.getContract(chainId);
      const filter = contract.filters[eventName]();
      const events = await contract.queryFilter(filter, fromBlock, toBlock);

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
    }

    // Sort by timestamp?
    return blockchainEvents;

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
      'FarmerAdded',
      'Invested',
      'ProjectStatusChanged',
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

  private async handleFarmerAddedEvent(data: any) {
    this.logger.log(
      `FarmerAdded event: Farmer ${data.idFarmer} added with collector ID ${data.idCollector}`,
    );

    // TODO: Store event in database and update farmer record
  }

  private async handleInvestedEvent(data: any) {
    this.logger.log(
      `Invested event: ${data.investor} invested ${data.amount} in project ${data.idProject}`,
    );

    // TODO: Store investment in database
  }

  private async handleProjectStatusChangedEvent(data: any) {
    this.logger.log(
      `ProjectStatusChanged event: Project ${data.idProject} changed from status ${data.oldStatus} to ${data.newStatus}`,
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
