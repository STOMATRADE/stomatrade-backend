import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfitsService } from './profits.service';
import { DepositProfitDto } from './dto/deposit-profit.dto';
import { ClaimProfitDto } from './dto/claim-profit.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '@prisma/client';

@ApiTags('Profits')
@ApiBearerAuth('JWT-auth')
@Controller('profits')
export class ProfitsController {
  constructor(private readonly profitsService: ProfitsService) {}

  @Roles(ROLES.ADMIN)
  @Post('deposit')
  @ApiOperation({
    summary: 'Deposit profit for a project (Admin only)',
    description:
      'Admin deposits profit to blockchain for distribution to investors',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Profit deposited successfully on blockchain',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Project not minted or blockchain transaction failed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  depositProfit(@Body() dto: DepositProfitDto) {
    return this.profitsService.depositProfit(dto);
  }

  @Post('claim')
  @ApiOperation({
    summary: 'Claim profit from a project (authenticated users)',
    description:
      'Investor claims their proportional profit from blockchain',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Profit claimed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'User has not invested in project or blockchain transaction failed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User or Project not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  claimProfit(@Body() dto: ClaimProfitDto) {
    return this.profitsService.claimProfit(dto);
  }

  @Roles(ROLES.ADMIN)
  @Get('pools')
  @ApiOperation({
    summary: 'Get all profit pools (Admin only)',
    description: 'Retrieve all profit pools with statistics',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profit pools retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  getAllProfitPools() {
    return this.profitsService.getAllProfitPools();
  }

  @Get('project/:projectId')
  @ApiOperation({
    summary: 'Get profit pool for a project (authenticated users)',
    description: 'Retrieve profit pool statistics for a specific project',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profit pool retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  getProjectProfitPool(@Param('projectId') projectId: string) {
    return this.profitsService.getProjectProfitPool(projectId);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get user profit claims (authenticated users)',
    description: 'Retrieve all profit claims made by a specific user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profit claims retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  getUserProfitClaims(@Param('userId') userId: string) {
    return this.profitsService.getUserProfitClaims(userId);
  }
}
