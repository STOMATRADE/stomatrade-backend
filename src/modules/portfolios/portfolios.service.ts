import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PortfoliosService {
  private readonly logger = new Logger(PortfoliosService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user's investment portfolio
   */
  async getUserPortfolio(userId: string) {
    this.logger.log(`Getting portfolio for user ${userId}`);

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get or create portfolio
    let portfolio = await this.prisma.investmentPortfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      // Create empty portfolio if doesn't exist
      portfolio = await this.prisma.investmentPortfolio.create({
        data: {
          userId,
          totalInvested: '0',
          totalProfit: '0',
          totalClaimed: '0',
          activeInvestments: 0,
          completedInvestments: 0,
          avgROI: 0,
        },
      });
    }

    // Get investments with details
    const investments = await this.prisma.investment.findMany({
      where: { userId, deleted: false },
      include: {
        project: {
          include: {
            farmer: true,
            land: true,
          },
        },
        profitClaims: true,
      },
      orderBy: {
        investedAt: 'desc',
      },
    });

    return {
      ...portfolio,
      investments: investments.map((inv) => ({
        id: inv.id,
        projectId: inv.projectId,
        projectName: inv.project.commodity,
        farmerName: inv.project.farmer.name,
        amount: inv.amount,
        receiptTokenId: inv.receiptTokenId,
        investedAt: inv.investedAt,
        profitClaimed: inv.profitClaims
          .reduce((sum, claim) => sum + BigInt(claim.amount), BigInt(0))
          .toString(),
        profitClaimsCount: inv.profitClaims.length,
      })),
    };
  }

  /**
   * Get all portfolios (admin only)
   */
  async getAllPortfolios() {
    this.logger.log('Getting all portfolios');

    return await this.prisma.investmentPortfolio.findMany({
      where: { deleted: false },
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            role: true,
          },
        },
      },
      orderBy: {
        totalInvested: 'desc',
      },
    });
  }

  /**
   * Get top investors
   */
  async getTopInvestors(limit = 10) {
    this.logger.log(`Getting top ${limit} investors`);

    return await this.prisma.investmentPortfolio.findMany({
      where: { deleted: false },
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
          },
        },
      },
      orderBy: {
        totalInvested: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get portfolio statistics
   */
  async getGlobalStats() {
    this.logger.log('Calculating global portfolio statistics');

    const portfolios = await this.prisma.investmentPortfolio.findMany({
      where: { deleted: false },
    });

    const totalInvested = portfolios.reduce(
      (sum, p) => sum + BigInt(p.totalInvested),
      BigInt(0),
    );

    const totalProfit = portfolios.reduce(
      (sum, p) => sum + BigInt(p.totalProfit),
      BigInt(0),
    );

    const totalClaimed = portfolios.reduce(
      (sum, p) => sum + BigInt(p.totalClaimed),
      BigInt(0),
    );

    const totalActiveInvestments = portfolios.reduce(
      (sum, p) => sum + p.activeInvestments,
      0,
    );

    const avgROI =
      portfolios.length > 0
        ? portfolios.reduce((sum, p) => sum + p.avgROI, 0) / portfolios.length
        : 0;

    return {
      totalInvestors: portfolios.length,
      totalInvested: totalInvested.toString(),
      totalProfit: totalProfit.toString(),
      totalClaimed: totalClaimed.toString(),
      totalActiveInvestments,
      avgROI,
    };
  }
}
