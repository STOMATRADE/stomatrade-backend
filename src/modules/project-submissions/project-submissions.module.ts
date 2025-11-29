import { Module } from '@nestjs/common';
import { ProjectSubmissionsController } from './project-submissions.controller';
import { ProjectSubmissionsService } from './project-submissions.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BlockchainModule } from '../../blockchain/blockchain.module';

@Module({
  imports: [PrismaModule, BlockchainModule],
  controllers: [ProjectSubmissionsController],
  providers: [ProjectSubmissionsService],
  exports: [ProjectSubmissionsService],
})
export class ProjectSubmissionsModule {}
