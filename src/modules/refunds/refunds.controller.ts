import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RefundsService } from './refunds.service';
import { MarkRefundableDto } from './dto/mark-refundable.dto';
import { ClaimRefundDto } from './dto/claim-refund.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { ChainId } from '../../common/decorators/chain-id.decorator';
import { ROLES } from '@prisma/client';
import { UserRefundClaimResponseDto } from './dto/refund-response.dto';
import { ProjectResponseDto } from '../projects/dto/project-response.dto';

@ApiTags('Refunds')
@ApiBearerAuth('JWT-auth')
@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) { }

  @Roles(ROLES.ADMIN)
  @Post('mark-refundable')
  @ApiOperation({
    summary: 'Mark project as refundable (Admin only)',
    description:
      'Admin marks a project as refundable when crowdfunding fails or project is cancelled',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project marked as refundable successfully',
    type: ProjectResponseDto,
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
  markRefundable(
    @Body() dto: MarkRefundableDto,
    @ChainId() chainId: number,
  ) {
    return this.refundsService.markRefundable(dto, chainId);
  }

  @Post('claim')
  @ApiOperation({
    summary: 'Claim refund from a project (authenticated users)',
    description:
      'Investor claims their investment back from a refundable project',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Refund claimed successfully',
    type: UserRefundClaimResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'User has not invested or blockchain transaction failed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User or Project not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  claimRefund(
    @Body() dto: ClaimRefundDto,
    @ChainId() chainId: number
  ) {
    return this.refundsService.claimRefund(dto, chainId);
  }

  @Get('projects')
  @ApiOperation({
    summary: 'Get all refundable projects (authenticated users)',
    description: 'Retrieve list of projects that are eligible for refunds',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Refundable projects retrieved successfully',
    type: [ProjectResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  getRefundableProjects() {
    return this.refundsService.getRefundableProjects();
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get user refund claims (authenticated users)',
    description: 'Retrieve all refund claims made by a specific user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User refund claims retrieved successfully',
    type: [UserRefundClaimResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  getUserRefundClaims(@Param('userId') userId: string) {
    return this.refundsService.getUserRefundClaims(userId);
  }
}
