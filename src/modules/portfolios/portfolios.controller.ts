import {
  Controller,
  Get,
  Param,
  Query,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PortfoliosService } from './portfolios.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ROLES } from '@prisma/client';

@ApiTags('Portfolios')
@ApiBearerAuth('JWT-auth')
@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Public()
  @Get('stats')
  @ApiOperation({
    summary: 'Get global portfolio statistics (Public)',
    description: 'Retrieve aggregated statistics across all investor portfolios',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Global statistics retrieved successfully',
  })
  getGlobalStats() {
    return this.portfoliosService.getGlobalStats();
  }

  @Public()
  @Get('top-investors')
  @ApiOperation({
    summary: 'Get top investors (Public)',
    description: 'Retrieve the top investors by total invested amount',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of top investors to return (default: 10)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Top investors retrieved successfully',
  })
  getTopInvestors(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.portfoliosService.getTopInvestors(limit || 10);
  }

  @Roles(ROLES.ADMIN)
  @Get('all')
  @ApiOperation({
    summary: 'Get all portfolios (Admin only)',
    description: 'Retrieve all investor portfolios',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All portfolios retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  getAllPortfolios() {
    return this.portfoliosService.getAllPortfolios();
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get user portfolio (authenticated users)',
    description: 'Retrieve investment portfolio for a specific user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User portfolio retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  getUserPortfolio(@Param('userId') userId: string) {
    return this.portfoliosService.getUserPortfolio(userId);
  }
}
