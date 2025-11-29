import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

@Injectable()
export class EthersProviderService implements OnModuleInit {
  private readonly logger = new Logger(EthersProviderService.name);
  private provider: ethers.JsonRpcProvider;
  private chainId: number;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL');
    const chainIdStr = this.configService.get<string>('BLOCKCHAIN_CHAIN_ID');

    if (!rpcUrl) {
      throw new Error('BLOCKCHAIN_RPC_URL is not configured');
    }

    this.chainId = chainIdStr ? parseInt(chainIdStr, 10) : 4202; // Default to Lisk Sepolia testnet

    // Create custom network for Lisk Sepolia (not recognized by default in ethers.js)
    const customNetwork = new ethers.Network('lisk-sepolia', this.chainId);

    this.provider = new ethers.JsonRpcProvider(rpcUrl, customNetwork, {
      staticNetwork: customNetwork,
    });

    try {
      const network = await this.provider.getNetwork();
      this.logger.log(
        `Connected to blockchain network: ${network.name} (Chain ID: ${network.chainId})`,
      );
    } catch (error) {
      this.logger.error('Failed to connect to blockchain provider', error);
      throw error;
    }
  }

  getProvider(): ethers.JsonRpcProvider {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    return this.provider;
  }

  getChainId(): number {
    return this.chainId;
  }

  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async getGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice || BigInt(0);
  }

  async estimateGas(transaction: ethers.TransactionRequest): Promise<bigint> {
    return await this.provider.estimateGas(transaction);
  }

  async waitForTransaction(
    txHash: string,
    confirmations = 1,
    timeout = 60000,
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      const receipt = await this.provider.waitForTransaction(
        txHash,
        confirmations,
        timeout,
      );
      return receipt;
    } catch (error) {
      this.logger.error(`Error waiting for transaction ${txHash}`, error);
      throw error;
    }
  }

  async getTransaction(txHash: string): Promise<ethers.TransactionResponse | null> {
    return await this.provider.getTransaction(txHash);
  }

  async getTransactionReceipt(
    txHash: string,
  ): Promise<ethers.TransactionReceipt | null> {
    return await this.provider.getTransactionReceipt(txHash);
  }

  async getBalance(address: string): Promise<bigint> {
    return await this.provider.getBalance(address);
  }

  async getBlock(blockNumber: number): Promise<ethers.Block | null> {
    return await this.provider.getBlock(blockNumber);
  }

  parseUnits(value: string, decimals = 18): bigint {
    return ethers.parseUnits(value, decimals);
  }

  formatUnits(value: bigint, decimals = 18): string {
    return ethers.formatUnits(value, decimals);
  }

  isAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  getAddress(address: string): string {
    return ethers.getAddress(address);
  }
}
