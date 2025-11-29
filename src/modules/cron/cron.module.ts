import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BlockchainModule } from '../../blockchain/blockchain.module';

@Module({
  imports: [PrismaModule, BlockchainModule],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}

