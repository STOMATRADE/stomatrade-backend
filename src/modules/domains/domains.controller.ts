import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DomainsService } from './domains.service';
import { DomainStatusResponseDto } from './dto/domain-status-response.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Domains')
@Public()
@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Get(':domainCode/status')
  @ApiOperation({
    summary: 'Get domain status',
    description: 'Get the status (TRUE/FALSE) of a domain by domain code',
  })
  @ApiParam({
    name: 'domainCode',
    description: 'Domain code (e.g., 001)',
    example: '001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Domain status retrieved successfully',
    type: DomainStatusResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Domain not found',
  })
  async getDomainStatus(
    @Param('domainCode') domainCode: string,
  ): Promise<DomainStatusResponseDto> {
    return this.domainsService.getDomainStatus(domainCode);
  }
}
