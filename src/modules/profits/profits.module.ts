import { Module } from '@nestjs/common';
import { ProfitsController } from './profits.controller';
import { ProfitsService } from './profits.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BlockchainModule } from '../../blockchain/blockchain.module';

@Module({
  imports: [PrismaModule, BlockchainModule],
  controllers: [ProfitsController],
  providers: [ProfitsService],
  exports: [ProfitsService],
})
export class ProfitsModule {}
