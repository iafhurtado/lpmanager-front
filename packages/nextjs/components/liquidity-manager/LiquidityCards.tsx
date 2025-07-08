"use client";

import { useEffect, useState } from "react";
import { getMockLiquidityData } from "~~/utils/mockData";

export const LiquidityCards = () => {
  const [liquidityData, setLiquidityData] = useState(getMockLiquidityData());

  useEffect(() => {
    // Poll every 15 seconds
    const interval = setInterval(() => {
      setLiquidityData(getMockLiquidityData());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Liquidity Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deployed Liquidity */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Deployed Liquidity</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="card bg-success border-success shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="card-title">Token 0 (USDC)</h4>
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
                    <h4 className="card-title">Token 1 (ETH)</h4>
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
                    <h4 className="card-title">Token 0 (USDC)</h4>
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
                    <h4 className="card-title">Token 1 (ETH)</h4>
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
                {(parseFloat(liquidityData.token0Deployed) + parseFloat(liquidityData.token0Idle)).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Total Token 1</p>
              <p className="text-xl font-bold text-primary">
                {(parseFloat(liquidityData.token1Deployed) + parseFloat(liquidityData.token1Idle)).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Deployed %</p>
              <p className="text-xl font-bold text-success">
                {(
                  (parseFloat(liquidityData.token0Deployed) /
                    (parseFloat(liquidityData.token0Deployed) + parseFloat(liquidityData.token0Idle))) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Idle %</p>
              <p className="text-xl font-bold text-warning">
                {(
                  (parseFloat(liquidityData.token0Idle) /
                    (parseFloat(liquidityData.token0Deployed) + parseFloat(liquidityData.token0Idle))) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
