import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EthersProviderService } from './services/ethers-provider.service';
import { PlatformWalletService } from './services/platform-wallet.service';
import { StomaTradeContractService } from './services/stomatrade-contract.service';
import { BlockchainEventService } from './services/blockchain-event.service';
import { TransactionService } from './services/transaction.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    EthersProviderService,
    PlatformWalletService,
    StomaTradeContractService,
    BlockchainEventService,
    TransactionService,
  ],
  exports: [
    EthersProviderService,
    PlatformWalletService,
    StomaTradeContractService,
    BlockchainEventService,
    TransactionService,
  ],
})
export class BlockchainModule {}
