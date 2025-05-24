export interface TokenBalance {
  address: string;
  balance: string;
  balanceFormatted: string;
}

export interface TokenAllowance {
  address: string;
  allowance: string;
  allowanceFormatted: string;
  bitforgeContract: string;
}

export interface TransactionResponse {
  success: boolean;
  txHash: string;
  address: string;
  amount?: string;
}

export interface Transaction {
  txHash: string;
  type: 'deposit' | 'withdraw' | 'rebalance' | 'harvest';
  status: 'success' | 'pending' | 'failed';
  amount?: string;
  timestamp: string;
}

export interface TransactionHistory {
  address: string;
  count: number;
  transactions: Transaction[];
}

export interface ApyData {
  total: number;
  strategies: {
    vesu: number;
    babylon: number;
    ekubo: number;
  };
}

export interface Allocation {
  vesu: number;
  babylon: number;
  ekubo: number;
}

export interface TotalDeposits {
  total: string;
  totalFormatted: string;
}

export interface YieldHistory {
  date: string;
  apy: string;
}

export interface YieldHistoryResponse {
  address: string;
  days: number;
  history: YieldHistory[];
}

export interface PriceData {
  timestamp: string;
  source: string;
  prices: Record<string, number>;
}

export interface VolatilityData {
  asset: string;
  timestamp: string;
  source: string;
  volatility: Record<string, number>;
}

export interface HistoricalPriceData {
  asset: string;
  days: number;
  timestamp: string;
  source: string;
  prices: Array<{
    date: string;
    price: string;
  }>;
}

export interface PreparedTransaction {
  contractAddress: string;
  entrypoint: string;
  calldata: string[]; // CallData.compile returns string[]
}
