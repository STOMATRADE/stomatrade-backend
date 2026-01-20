import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { InvestmentsService } from './investments.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { InvestmentResponseDto } from './dto/investment-response.dto';
import { BuildTransactionDto, BuildTransactionResponseDto } from './dto/build-transaction.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ROLES } from '@prisma/client';

@ApiTags('Investments')
@ApiBearerAuth('JWT-auth')
@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  /**
   * @deprecated Use POST /investments/build-transaction instead.
   * This endpoint executes transactions via platform wallet which causes issues.
   * The new endpoint returns transaction data for frontend to execute with user's wallet.
   */
  @Roles(ROLES.INVESTOR)
  @Post()
  @ApiOperation({
    summary: '[DEPRECATED] Create an investment in a project (Investor only)',
    description:
      '⚠️ DEPRECATED: This endpoint executes transactions via platform wallet which may fail. ' +
      'Use POST /investments/build-transaction instead to get transaction data for frontend execution.\n\n' +
      'Investor invests in a project and automatically receives a receipt NFT from the blockchain',
    deprecated: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Investment created and receipt NFT minted successfully',
    type: InvestmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Project not minted or blockchain transaction failed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User or Project not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Investor role required',
  })
  create(@Body() dto: CreateInvestmentDto): Promise<InvestmentResponseDto> {
    return this.investmentsService.create(dto);
  }

  @Roles(ROLES.INVESTOR)
  @Post('build-transaction')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Build transaction data for investment (Investor only)',
    description:
      'Returns hex encoded transaction data for IDRX approval and invest function calls. ' +
      'Frontend should execute these transactions sequentially using the user wallet:\n' +
      '1. First execute the approval transaction to approve IDRX spending\n' +
      '2. Then execute the invest transaction to invest in the project\n\n' +
      'The investment record will be created automatically when the Invested event is indexed by the cron job.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction data built successfully',
    type: BuildTransactionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Project not minted or not active on blockchain',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Investor role required',
  })
  buildTransaction(@Body() dto: BuildTransactionDto): Promise<BuildTransactionResponseDto> {
    return this.investmentsService.buildTransactionData(dto);
  }

  @Roles(ROLES.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Get all investments (Admin only)',
    description:
      'Retrieve all investments with optional filters by user or project',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Filter by user ID',
  })
  @ApiQuery({
    name: 'projectId',
    required: false,
    type: String,
    description: 'Filter by project ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Investments retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  findAll(
    @Query('userId') userId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.investmentsService.findAll(userId, projectId);
  }

  /**
   * @deprecated Using GET for state-changing operation violates REST principles.
   * Use POST /investments/portfolio/recalculate instead.
   * This endpoint is maintained for backward compatibility only.
   */
  @Roles(ROLES.ADMIN)
  @Get('portfolio/recalculate')
  @ApiOperation({
    summary: '[DEPRECATED] Recalculate all user portfolios (Admin only)',
    description:
      '⚠️ DEPRECATED: This endpoint uses GET method for a state-changing operation, which violates REST principles. ' +
      'Use POST /investments/portfolio/recalculate instead. ' +
      'This endpoint is maintained for backward compatibility only.\n\n' +
      'Manually trigger portfolio recalculation for all users (typically called by cron job)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Portfolios recalculated successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  recalculatePortfoliosDeprecated() {
    return this.investmentsService.recalculateAllPortfolios();
  }

  @Roles(ROLES.ADMIN)
  @Post('portfolio/recalculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recalculate all user portfolios (Admin only)',
    description:
      'Manually trigger portfolio recalculation for all users. ' +
      'This operation updates portfolio statistics and investment calculations. ' +
      'Typically called by cron job or manual admin intervention.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Portfolios recalculated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'All portfolios recalculated successfully' },
        portfoliosUpdated: { type: 'number', example: 150 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  recalculatePortfolios() {
    return this.investmentsService.recalculateAllPortfolios();
  }

  @Public()
  @Get('project/:projectId/stats')
  @ApiOperation({
    summary: 'Get investment statistics for a project (Public)',
    description:
      'Retrieve aggregated investment data for a specific project',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project investment statistics retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  getProjectStats(@Param('projectId') projectId: string) {
    return this.investmentsService.getProjectStats(projectId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get investment by ID (authenticated users)',
    description: 'Retrieve a single investment with details',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Investment retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Investment not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  findOne(@Param('id') id: string) {
    return this.investmentsService.findOne(id);
  }
}