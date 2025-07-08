"use client";

import { useEffect, useState } from "react";
import { getMockAdjustmentHistory, getMockLiquidityData, getMockPriceData } from "~~/utils/mockData";

export interface LiquidityManagerData {
  totalAmounts: {
    total0: bigint;
    total1: bigint;
  };
  basePosition: {
    liquidity: bigint;
    amount0: bigint;
    amount1: bigint;
  };
  currentTick: number;
  timeWeightedPrice: bigint;
  userBalance: bigint;
  token0Allowance: bigint;
  token1Allowance: bigint;
  token0Address: string;
  token1Address: string;
  contractName: string;
  contractSymbol: string;
  contractDecimals: number;
  fee: bigint;
  feeSplit: bigint;
  hysteresis: bigint;
}

export interface PriceData {
  oraclePrice: string;
  poolPrice: string;
  priceDifference: number;
  priceDifferencePercent: number;
  volatility: string;
  oracleTimestamp: number;
  poolTimestamp: number;
}

export interface AdjustmentRecord {
  id: string;
  timestamp: number;
  type: "deposit" | "withdraw" | "rebalance";
  token0Amount: string;
  token1Amount: string;
  shares?: string;
  newLowerTick?: number;
  newUpperTick?: number;
  txHash: string;
  sender: string;
  to: string;
}

export const useLiquidityManager = () => {
  const [liquidityData, setLiquidityData] = useState<LiquidityManagerData | null>(null);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [adjustmentHistory, setAdjustmentHistory] = useState<AdjustmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data initialization
  useEffect(() => {
    const initializeData = () => {
      // Mock liquidity data
      const mockLiquidity = getMockLiquidityData();
      setLiquidityData({
        totalAmounts: {
          total0:
            BigInt(Math.floor(parseFloat(mockLiquidity.token0Deployed) + parseFloat(mockLiquidity.token0Idle))) *
            BigInt(1e18),
          total1:
            BigInt(Math.floor(parseFloat(mockLiquidity.token1Deployed) + parseFloat(mockLiquidity.token1Idle))) *
            BigInt(1e18),
        },
        basePosition: {
          liquidity: BigInt(1000000),
          amount0: BigInt(Math.floor(parseFloat(mockLiquidity.token0Deployed))) * BigInt(1e18),
          amount1: BigInt(Math.floor(parseFloat(mockLiquidity.token1Deployed))) * BigInt(1e18),
        },
        currentTick: 123456,
        timeWeightedPrice: BigInt(1500000000000000000),
        userBalance: BigInt(1000000000000000000), // 1 LP token
        token0Allowance: BigInt(0),
        token1Allowance: BigInt(0),
        token0Address: "0x0000000000000000000000000000000000000000",
        token1Address: "0x0000000000000000000000000000000000000000",
        contractName: "LP Manager Token",
        contractSymbol: "LPMT",
        contractDecimals: 18,
        fee: BigInt(3000), // 0.3%
        feeSplit: BigInt(5000), // 50%
        hysteresis: BigInt(100), // 1%
      });

      // Mock price data with static timestamps
      const mockPrice = getMockPriceData();
      setPriceData({
        oraclePrice: mockPrice.oraclePrice,
        poolPrice: mockPrice.poolPrice,
        priceDifference: mockPrice.priceDifference,
        priceDifferencePercent: mockPrice.priceDifferencePercent,
        volatility: mockPrice.volatility,
        oracleTimestamp: 1700000000000, // Static timestamp
        poolTimestamp: 1700000000000, // Static timestamp
      });

      // Mock adjustment history
      const mockHistory = getMockAdjustmentHistory();
      setAdjustmentHistory(
        mockHistory.map(item => ({
          id: item.id,
          timestamp: item.timestamp,
          type: item.type,
          token0Amount: item.token0Amount,
          token1Amount: item.token1Amount,
          shares: "0.5",
          txHash: item.txHash,
          sender: "0x1234567890123456789012345678901234567890",
          to: "0x0987654321098765432109876543210987654321",
        })),
      );

      setIsLoading(false);
    };

    initializeData();

    // Poll for updates every 15 seconds
    const interval = setInterval(() => {
      const mockPrice = getMockPriceData();
      setPriceData({
        oraclePrice: mockPrice.oraclePrice,
        poolPrice: mockPrice.poolPrice,
        priceDifference: mockPrice.priceDifference,
        priceDifferencePercent: mockPrice.priceDifferencePercent,
        volatility: mockPrice.volatility,
        oracleTimestamp: 1700000000000, // Static timestamp
        poolTimestamp: 1700000000000, // Static timestamp
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Mock contract interaction functions
  const deposit = async (amount0: string, amount1: string, to: string) => {
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Mock deposit: ${amount0} token0, ${amount1} token1 to ${to}`);
    return { hash: "0x1234567890abcdef" };
  };

  const withdraw = async (shares: string, to: string) => {
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Mock withdraw: ${shares} shares to ${to}`);
    return { hash: "0xabcdef1234567890" };
  };

  const approveToken0 = async (spender: string, amount: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Mock approve token0: ${amount} to ${spender}`);
    return { hash: "0xapprove1234567890" };
  };

  const approveToken1 = async (spender: string, amount: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Mock approve token1: ${amount} to ${spender}`);
    return { hash: "0xapprove0987654321" };
  };

  const rebalance = async (baseLower: number, baseUpper: number, swapQuantity: string, tickLimit: number) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log(`Mock rebalance: ${baseLower}-${baseUpper}, swap: ${swapQuantity}, limit: ${tickLimit}`);
    return { hash: "0xrebalance1234567890" };
  };

  const autoRebalance = async (useOracle: boolean, withSwapping: boolean) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log(`Mock auto rebalance: oracle=${useOracle}, swap=${withSwapping}`);
    return { hash: "0xautorebalance1234567890" };
  };

  const fetchPriceData = async () => {
    const mockPrice = getMockPriceData();
    setPriceData({
      oraclePrice: mockPrice.oraclePrice,
      poolPrice: mockPrice.poolPrice,
      priceDifference: mockPrice.priceDifference,
      priceDifferencePercent: mockPrice.priceDifferencePercent,
      volatility: mockPrice.volatility,
      oracleTimestamp: 1700000000000, // Static timestamp
      poolTimestamp: 1700000000000, // Static timestamp
    });
  };

  return {
    // Data
    liquidityData,
    priceData,
    adjustmentHistory,
    isLoading,

    // Contract interactions (mock)
    deposit,
    withdraw,
    approveToken0,
    approveToken1,
    rebalance,
    autoRebalance,

    // Refresh functions
    fetchPriceData,
  };
};
