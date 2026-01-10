import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainStatusResponseDto } from './dto/domain-status-response.dto';

@Injectable()
export class DomainsService {
  private readonly logger = new Logger(DomainsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDomainStatus(domainCode: string): Promise<DomainStatusResponseDto> {
    this.logger.log(`Getting status for domain code: ${domainCode}`);

    const domain = await this.prisma.domain.findUnique({
      where: {
        domainCode,
        deleted: false,
      },
    });

    if (!domain) {
      throw new NotFoundException(`Domain with code ${domainCode} not found`);
    }

    return {
      status: domain.domainStatus,
    };
  }
}
