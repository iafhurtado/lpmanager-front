"use client";

import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { lpManagerAbi } from "~~/app/liquidity-manager/lpmanager-abi";
import { getMockPriceData } from "~~/utils/mockData";

// Token addresses and decimals
const token0Address = "0xF197FFC28c23E0309B5559e7a166f2c6164C80aA"; // MXNb
const token1Address = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"; // USDT0
const TOKEN0_DECIMALS = 6; // MXNb has 6 decimals
const TOKEN1_DECIMALS = 18; // USDT0 has 18 decimals
// const AMOUNT_IN = BigInt(10 ** TOKEN0_DECIMALS); // 1 MXNb token for price calculation
const CONTRACT_ADDRESS = "0x3b7b4EB1186B889Df55e9184738468CCE1a6703f"; // LiquidityManager contract address

export const PriceMetrics = () => {
  const [priceData, setPriceData] = useState(getMockPriceData());
  const [currentTime, setCurrentTime] = useState("");

  // Basic contract verification calls
  const { data: contractToken0 } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: lpManagerAbi,
    functionName: "token0",
  });

  const { data: contractToken1 } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: lpManagerAbi,
    functionName: "token1",
  });

  const { data: poolAddress } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: lpManagerAbi,
    functionName: "pool",
  });

  // Try different amounts for price calculation
  const AMOUNT_IN_SMALL = BigInt(10 ** TOKEN0_DECIMALS); // 1 MXNb
  const AMOUNT_IN_MEDIUM = BigInt(10 ** TOKEN0_DECIMALS) * BigInt(100); // 100 MXNb
  const AMOUNT_IN_LARGE = BigInt(10 ** TOKEN0_DECIMALS) * BigInt(10000); // 10,000 MXNb

  // Oracle price call with different amounts
  const {
    data: oracleAmountOut,
    isError: oracleError,
    error: oracleErrorData,
  } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: lpManagerAbi,
    functionName: "fetchOracle",
    args: [token0Address as `0x${string}`, token1Address as `0x${string}`, AMOUNT_IN_LARGE],
  });

  // Pool spot price call with different amounts
  const {
    data: spotAmountOut,
    isError: spotError,
    error: spotErrorData,
  } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: lpManagerAbi,
    functionName: "fetchSpot",
    args: [token0Address as `0x${string}`, token1Address as `0x${string}`, AMOUNT_IN_LARGE],
  });

  // Debug contract calls
  useEffect(() => {
    console.log("=== Contract Call Debug ===");
    console.log("Contract Address:", CONTRACT_ADDRESS);
    console.log("Pool Address:", poolAddress);
    console.log("Contract Token0:", contractToken0);
    console.log("Contract Token1:", contractToken1);
    console.log("Our Token0 Address:", token0Address);
    console.log("Our Token1 Address:", token1Address);
    console.log("Amount In (1 MXNb):", AMOUNT_IN_SMALL.toString());
    console.log("Amount In (100 MXNb):", AMOUNT_IN_MEDIUM.toString());
    console.log("Amount In (10,000 MXNb):", AMOUNT_IN_LARGE.toString());
    console.log("Oracle Amount Out:", oracleAmountOut);
    console.log("Spot Amount Out:", spotAmountOut);
    console.log("Oracle Error:", oracleError, oracleErrorData);
    console.log("Spot Error:", spotError, spotErrorData);
    console.log("==========================");
  }, [
    oracleAmountOut,
    spotAmountOut,
    oracleError,
    spotError,
    oracleErrorData,
    spotErrorData,
    contractToken0,
    contractToken1,
    poolAddress,
  ]);

  // Update current time on client side to avoid hydration mismatch
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };

    updateTime(); // Set initial time
    const interval = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

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

      // Console logging for debugging
      console.log("=== Price Data ===");
      console.log("Token0 (MXNb):", token0Address);
      console.log("Token1 (USDT0):", token1Address);
      console.log("Amount In (10,000 MXNb):", AMOUNT_IN_LARGE.toString());
      console.log("Oracle Amount Out (raw):", oracleAmountOut.toString());
      console.log("Spot Amount Out (raw):", spotAmountOut.toString());
      console.log("Oracle Price (USDT0 per MXNb):", oraclePrice);
      console.log("Pool Price (USDT0 per MXNb):", poolPrice);
      console.log("Price Difference:", priceDifference);
      console.log("Price Difference %:", priceDifferencePercent.toFixed(4) + "%");
      console.log("==================");

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

  return (
    <div className="grid grid-cols-2 gap-2">
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
          <p className="text-lg text-white dark:text-primary">{currentTime}</p>
        </div>
      </div>

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
          <p className="text-lg text-white dark:text-primary">{currentTime}</p>
        </div>
      </div>

      {/* Price Difference */}
      <div className="card shadow-sm bg-primary dark:bg-neutral dark:text-primary">
        <div className="card-body p-3">
          <h3 className="card-title text-lg mb-1 text-white dark:text-primary">Difference</h3>
          <p className="text-4xl font-bold text-white dark:text-primary">${priceData.priceDifference.toFixed(6)}</p>
          <div className="badge badge-outline badge-lg text-white dark:text-primary">{priceData.volatility}</div>
        </div>
      </div>

      {/* Volatility */}
      <div className="card shadow-sm bg-primary dark:bg-neutral dark:text-primary">
        <div className="card-body p-3">
          <h3 className="card-title text-lg mb-1 text-white dark:text-primary">Volatility</h3>
          <p className="text-4xl font-bold text-white dark:text-primary">
            {priceData.priceDifferencePercent.toFixed(2)}%
          </p>
          <p className="text-lg text-white dark:text-primary">{priceData.volatility} risk</p>
        </div>
      </div>
    </div>
  );
};
