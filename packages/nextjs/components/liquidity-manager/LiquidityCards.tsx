"use client";

import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { lpManagerAbi } from "~~/app/liquidity-manager/lpmanager-abi";

// Contract configuration
const CONTRACT_ADDRESS = "0x3b7b4EB1186B889Df55e9184738468CCE1a6703f";
const TOKEN0_DECIMALS = 6; // MXNb has 6 decimals
const TOKEN1_DECIMALS = 6; // USDT0 has 18 decimals

export const LiquidityCards = () => {
  const [liquidityData, setLiquidityData] = useState({
    token0Deployed: "0",
    token1Deployed: "0",
    token0Idle: "0",
    token1Idle: "0",
  });

  // Get base position from contract
  const {
    data: basePosition,
    isError: basePositionError,
    error: basePositionErrorData,
    isLoading: basePositionLoading,
  } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: lpManagerAbi,
    functionName: "getBasePosition",
  });

  // Get total amounts from contract
  const {
    data: totalAmounts,
    isError: totalAmountsError,
    error: totalAmountsErrorData,
    isLoading: totalAmountsLoading,
  } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: lpManagerAbi,
    functionName: "getTotalAmounts",
  });

  // Debug contract calls
  useEffect(() => {
    console.log("=== Contract Call Debug ===");
    console.log("Contract Address:", CONTRACT_ADDRESS);
    console.log("Base Position Loading:", basePositionLoading);
    console.log("Total Amounts Loading:", totalAmountsLoading);
    console.log("Base Position Data:", basePosition);
    console.log("Total Amounts Data:", totalAmounts);
    console.log("Base Position Error:", basePositionError, basePositionErrorData);
    console.log("Total Amounts Error:", totalAmountsError, totalAmountsErrorData);
    console.log("==========================");
  }, [
    basePosition,
    totalAmounts,
    basePositionError,
    totalAmountsError,
    basePositionErrorData,
    totalAmountsErrorData,
    basePositionLoading,
    totalAmountsLoading,
  ]);

  useEffect(() => {
    // Update liquidity data when contract data changes
    if (basePosition && totalAmounts) {
      console.log("Processing contract data...");
      const [liquidity, amount0, amount1] = basePosition as [bigint, bigint, bigint];
      const [total0, total1] = totalAmounts as [bigint, bigint];

      // Convert amounts to readable format
      // MXNb: 6 decimals, USDT0: 18 decimals
      const deployed0 = Number(amount0) / 10 ** TOKEN0_DECIMALS; // 1844512489 / 10^6 = 1844.512489
      const deployed1 = Number(amount1) / 10 ** TOKEN1_DECIMALS; // 98773937 / 10^18 = 0.000000098773937
      const total0Formatted = Number(total0) / 10 ** TOKEN0_DECIMALS; // 1844512489 / 10^6 = 1844.512489
      const total1Formatted = Number(total1) / 10 ** TOKEN1_DECIMALS; // 101842445 / 10^18 = 0.000000101842445

      // Calculate idle amounts (total - deployed)
      const idle0 = total0Formatted - deployed0;
      const idle1 = total1Formatted - deployed1;

      console.log("=== Liquidity Data ===");
      console.log("Base Position:", {
        liquidity: liquidity.toString(),
        amount0: amount0.toString(),
        amount1: amount1.toString(),
      });
      console.log("Total Amounts:", {
        total0: total0.toString(),
        total1: total1.toString(),
      });
      console.log("Formatted Amounts:", {
        deployed0: deployed0.toFixed(6),
        deployed1: deployed1.toFixed(6),
        idle0: idle0.toFixed(6),
        idle1: idle1.toFixed(6),
      });
      console.log("======================");

      setLiquidityData({
        token0Deployed: deployed0.toFixed(6),
        token1Deployed: deployed1.toFixed(6),
        token0Idle: Math.max(0, idle0).toFixed(6),
        token1Idle: Math.max(0, idle1).toFixed(6),
      });
    } else {
      console.log("Contract data not available yet or failed");
    }
  }, [basePosition, totalAmounts]);

  // Fallback to mock data if contract calls fail
  useEffect(() => {
    if (basePositionError || totalAmountsError || !basePosition || !totalAmounts) {
      console.log("Using fallback - contract calls failed or returned null");
      console.log("Base Position Error:", basePositionError);
      console.log("Total Amounts Error:", totalAmountsError);
      console.log("Base Position:", basePosition);
      console.log("Total Amounts:", totalAmounts);
    }
  }, [basePositionError, totalAmountsError, basePosition, totalAmounts]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Liquidity Overview</h2>

      {/* Debug Info */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Debug Info</h3>
          <div className="text-sm">
            <p>Base Position Loading: {basePositionLoading ? "Yes" : "No"}</p>
            <p>Total Amounts Loading: {totalAmountsLoading ? "Yes" : "No"}</p>
            <p>Base Position Error: {basePositionError ? "Yes" : "No"}</p>
            <p>Total Amounts Error: {totalAmountsError ? "Yes" : "No"}</p>
            <p>Base Position Data: {basePosition ? "Available" : "Not Available"}</p>
            <p>Total Amounts Data: {totalAmounts ? "Available" : "Not Available"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deployed Liquidity */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Deployed Liquidity</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="card bg-success border-success shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="card-title">Token 0 (MXNb)</h4>
                    <p className="text-2xl font-bold">{liquidityData.token0Deployed}</p>
                  </div>
                  <div className="text-right">
                    <div className="badge badge-success">Deployed</div>
                    <p className="text-sm text-base-content mt-1">In Position</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-success border-success shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="card-title">Token 1 (USDT0)</h4>
                    <p className="text-2xl font-bold">{liquidityData.token1Deployed}</p>
                  </div>
                  <div className="text-right">
                    <div className="badge badge-success">Deployed</div>
                    <p className="text-sm text-base-content mt-1">In Position</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Idle Liquidity */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Idle Liquidity</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="card bg-warning border-warning shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="card-title">Token 0 (MXNb)</h4>
                    <p className="text-2xl font-bold">{liquidityData.token0Idle}</p>
                  </div>
                  <div className="text-right">
                    <div className="badge badge-warning">Idle</div>
                    <p className="text-sm text-base-content mt-1">Available</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-warning border-warning shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="card-title">Token 1 (USDT0)</h4>
                    <p className="text-2xl font-bold">{liquidityData.token1Idle}</p>
                  </div>
                  <div className="text-right">
                    <div className="badge badge-warning">Idle</div>
                    <p className="text-sm text-base-content mt-1">Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Summary */}
      <div className="card bg-base-200 shadow-2xl">
        <div className="card-body">
          <h3 className="card-title justify-center">Total Liquidity</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-base-content/70">Total Token 0</p>
              <p className="text-xl font-bold text-primary">
                {(parseFloat(liquidityData.token0Deployed) + parseFloat(liquidityData.token0Idle)).toFixed(6)}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Total Token 1</p>
              <p className="text-xl font-bold text-primary">
                {(parseFloat(liquidityData.token1Deployed) + parseFloat(liquidityData.token1Idle)).toFixed(6)}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Deployed %</p>
              <p className="text-xl font-bold text-success">
                {parseFloat(liquidityData.token0Deployed) + parseFloat(liquidityData.token0Idle) > 0
                  ? (
                      (parseFloat(liquidityData.token0Deployed) /
                        (parseFloat(liquidityData.token0Deployed) + parseFloat(liquidityData.token0Idle))) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Idle %</p>
              <p className="text-xl font-bold text-warning">
                {parseFloat(liquidityData.token0Deployed) + parseFloat(liquidityData.token0Idle) > 0
                  ? (
                      (parseFloat(liquidityData.token0Idle) /
                        (parseFloat(liquidityData.token0Deployed) + parseFloat(liquidityData.token0Idle))) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
