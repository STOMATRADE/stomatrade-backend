import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DomainsService } from './domains.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockPrismaService } from '../../test/mocks/prisma.mock';

describe('DomainsService', () => {
  let service: DomainsService;
  let prisma: typeof mockPrismaService;

  const mockDomain = {
    id: 1,
    domainCode: '001',
    domainDesc: 'SWITCHER ON OFF API',
    domainStatus: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomainsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DomainsService>(DomainsService);
    prisma = mockPrismaService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDomainStatus', () => {
    it('should return domain status when domain exists', async () => {
      prisma.domain.findUnique.mockResolvedValue(mockDomain);

      const result = await service.getDomainStatus('001');

      expect(prisma.domain.findUnique).toHaveBeenCalledWith({
        where: {
          domainCode: '001',
          deleted: false,
        },
      });
      expect(result).toEqual({ status: true });
    });

    it('should return false status when domain status is false', async () => {
      const mockDomainOff = { ...mockDomain, domainStatus: false };
      prisma.domain.findUnique.mockResolvedValue(mockDomainOff);

      const result = await service.getDomainStatus('001');

      expect(result).toEqual({ status: false });
    });

    it('should throw NotFoundException when domain not found', async () => {
      prisma.domain.findUnique.mockResolvedValue(null);

      await expect(service.getDomainStatus('999')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getDomainStatus('999')).rejects.toThrow(
        'Domain with code 999 not found',
      );
    });

    it('should throw NotFoundException when domain is deleted', async () => {
      prisma.domain.findUnique.mockResolvedValue(null);

      await expect(service.getDomainStatus('001')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
