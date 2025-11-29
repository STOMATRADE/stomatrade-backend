import { Module } from '@nestjs/common';
import { FarmerSubmissionsController } from './farmer-submissions.controller';
import { FarmerSubmissionsService } from './farmer-submissions.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BlockchainModule } from '../../blockchain/blockchain.module';

@Module({
  imports: [PrismaModule, BlockchainModule],
  controllers: [FarmerSubmissionsController],
  providers: [FarmerSubmissionsService],
  exports: [FarmerSubmissionsService],
})
export class FarmerSubmissionsModule {}
