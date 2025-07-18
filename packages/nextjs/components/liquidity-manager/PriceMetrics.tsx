"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { lpManagerAbi } from "~~/app/liquidity-manager/lpmanager-abi";
import { getMockPriceData } from "~~/utils/mockData";

// Token addresses and decimals
const token0Address = "0xF197FFC28c23E0309B5559e7a166f2c6164C80aA"; // MXNb
const token1Address = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"; // USDT0
const TOKEN0_DECIMALS = 6; // MXNb has 6 decimals
const TOKEN1_DECIMALS = 6; // USDT0 has 18 decimals
// const AMOUNT_IN = BigInt(10 ** TOKEN0_DECIMALS); // 1 MXNb token for price calculation
const CONTRACT_ADDRESS = "0x3b7b4EB1186B889Df55e9184738468CCE1a6703f"; // LiquidityManager contract address

export const PriceMetrics = () => {
  const [priceData, setPriceData] = useState(getMockPriceData());
  const { address: userAddress } = useAccount();

  // Share Balance call
  const { data: shareBalance } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: lpManagerAbi,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  // Try different amounts for price calculation
  const AMOUNT_IN_SMALL = BigInt(10 ** TOKEN0_DECIMALS); // 1 MXNb

  // Oracle price call with different amounts
  const { data: oracleAmountOut } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: lpManagerAbi,
    functionName: "fetchOracle",
    args: [token1Address as `0x${string}`, token0Address as `0x${string}`, AMOUNT_IN_SMALL],
  });

  // Pool spot price call with different amounts
  const { data: spotAmountOut } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: lpManagerAbi,
    functionName: "fetchSpot",
    args: [token1Address as `0x${string}`, token0Address as `0x${string}`, AMOUNT_IN_SMALL],
  });

  useEffect(() => {
    // Update price data when contract data changes
    if (
      oracleAmountOut !== undefined &&
      oracleAmountOut !== null &&
      spotAmountOut !== undefined &&
      spotAmountOut !== null
    ) {
      // Convert from token1 decimals (18) to readable format
      const oraclePrice = Number(oracleAmountOut) / 10 ** TOKEN1_DECIMALS;
      const poolPrice = Number(spotAmountOut) / 10 ** TOKEN1_DECIMALS;
      const priceDifference = Math.abs(oraclePrice - poolPrice);
      const priceDifferencePercent = (priceDifference / oraclePrice) * 100;

      setPriceData({
        oraclePrice: oraclePrice.toFixed(6),
        poolPrice: poolPrice.toFixed(6),
        priceDifference,
        priceDifferencePercent,
        volatility: priceDifferencePercent > 5 ? "High" : priceDifferencePercent > 2 ? "Medium" : "Low",
        oracleTimestamp: Date.now(),
        poolTimestamp: Date.now(),
      });
    }
  }, [oracleAmountOut, spotAmountOut]);

  // Fallback to mock data if contract calls fail
  useEffect(() => {
    if (
      oracleAmountOut === undefined ||
      oracleAmountOut === null ||
      spotAmountOut === undefined ||
      spotAmountOut === null
    ) {
      console.log("Using fallback mock data - contract calls failed or returned null");
      const interval = setInterval(() => {
        setPriceData(getMockPriceData());
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [oracleAmountOut, spotAmountOut]);

  // Format share balance for display
  const formattedShareBalance = shareBalance ? Number(shareBalance) / 10 ** 6 : 0;

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Pool Market Price */}
      <div className="card border-primary shadow-sm bg-primary dark:bg-neutral dark:text-primary">
        <div className="card-body p-3">
          <h3 className="card-title text-lg mb-1 text-white dark:text-primary">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Pool
          </h3>
          <p className="text-4xl font-bold text-white dark:text-primary">${priceData.poolPrice}</p>
        </div>
      </div>

      {/* Share Balance */}
      <div className="card border-success shadow-sm bg-primary dark:bg-neutral dark:text-primary">
        <div className="card-body p-3">
          <h3 className="card-title text-lg mb-1 text-white dark:text-primary">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            Shares
          </h3>
          <p className="text-4xl font-bold text-white dark:text-primary">{formattedShareBalance.toFixed(4)}</p>
        </div>
      </div>

      {/* Oracle Price */}
      <div className="card border-info shadow-sm bg-primary dark:bg-neutral dark:text-primary">
        <div className="card-body p-3">
          <h3 className="card-title text-lg mb-1 text-white dark:text-primary">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Oracle
          </h3>
          <p className="text-4xl font-bold text-white dark:text-primary">${priceData.oraclePrice}</p>
        </div>
      </div>

      {/* Price Difference */}
      <div className="card shadow-sm bg-primary dark:bg-neutral dark:text-primary">
        <div className="card-body p-3">
          <h3 className="card-title text-lg mb-1 text-white dark:text-primary">Difference</h3>
          <p className="text-4xl font-bold text-white dark:text-primary">${priceData.priceDifference.toFixed(6)}</p>
        </div>
      </div>
    </div>
  );
};
