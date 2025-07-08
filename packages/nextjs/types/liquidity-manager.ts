export interface LiquidityPosition {
  id: string;
  token0Deployed: string;
  token1Deployed: string;
  token0Idle: string;
  token1Idle: string;
  lowerTick: number;
  upperTick: number;
  totalValue: number;
  apy: number;
  createdAt: number;
  lastUpdated: number;
}

export interface PriceData {
  timestamp: number;
  price: number;
  volume?: number;
}

export interface AdjustmentRecord {
  id: string;
  timestamp: number;
  type: "deposit" | "withdraw";
  token0Amount: string;
  token1Amount: string;
  newLowerTick: number;
  newUpperTick: number;
  txHash: string;
  gasUsed?: string;
  gasPrice?: string;
}

export interface ContractAddresses {
  lpToken: string;
  pool: string;
  oracle: string;
  manager: string;
  token0: string;
  token1: string;
}

export interface TransactionState {
  isApproving: boolean;
  isExecuting: boolean;
  step: "input" | "approve" | "execute" | "success" | "error";
  error?: string;
  txHash?: string;
}

export interface ChartData {
  prices: PriceData[];
  bounds: {
    lower: number;
    upper: number;
  };
  currentPrice: number;
}

export interface LiquidityMetrics {
  deployed: {
    token0: string;
    token1: string;
    percentage: number;
  };
  idle: {
    token0: string;
    token1: string;
    percentage: number;
  };
  total: {
    token0: string;
    token1: string;
    value: number;
  };
}
