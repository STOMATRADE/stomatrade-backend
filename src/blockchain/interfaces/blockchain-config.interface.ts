export interface BlockchainConfig {
  rpcUrl: string;
  chainId: number;
  stomaTradeContractAddress: string;
  idrxTokenContractAddress: string;
  platformWalletPrivateKey: string;
  confirmationBlocks: number;
  gasLimitMultiplier: number;
  maxRetries: number;
  retryDelay: number;
}

export interface ContractAddresses {
  stomaTrade: string;
  idrxToken: string;
}

export interface TransactionConfig {
  confirmationBlocks: number;
  gasLimitMultiplier: number;
  maxRetries: number;
  retryDelay: number;
}
