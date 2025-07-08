"use client";

import { useEffect, useState } from "react";
import { getMockAdjustmentHistory } from "~~/utils/mockData";

interface AdjustmentRecord {
  id: string;
  timestamp: number;
  type: "deposit" | "withdraw" | "rebalance";
  token0Amount: string;
  token1Amount: string;
  newLowerTick: number;
  newUpperTick: number;
  txHash: string;
}

export const AdjustmentHistory = () => {
  const [adjustments, setAdjustments] = useState<AdjustmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const fetchAdjustments = () => {
      const mockData = getMockAdjustmentHistory();

      // Add some rebalance events
      const rebalanceEvents: AdjustmentRecord[] = [
        {
          id: "rebalance-1",
          timestamp: Date.now() - 3600000, // 1 hour ago
          type: "rebalance",
          token0Amount: "1500.00",
          token1Amount: "2.50",
          newLowerTick: 123000,
          newUpperTick: 125000,
          txHash: "0xrebalance1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        },
        {
          id: "rebalance-2",
          timestamp: Date.now() - 7200000, // 2 hours ago
          type: "rebalance",
          token0Amount: "1200.00",
          token1Amount: "2.00",
          newLowerTick: 122500,
          newUpperTick: 124500,
          txHash: "0xrebalance0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
        },
        {
          id: "rebalance-3",
          timestamp: Date.now() - 10800000, // 3 hours ago
          type: "rebalance",
          token0Amount: "1800.00",
          token1Amount: "3.00",
          newLowerTick: 124000,
          newUpperTick: 126000,
          txHash: "0xrebalanceabcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        },
      ];

      setAdjustments([...rebalanceEvents, ...mockData]);
      setIsLoading(false);
    };

    fetchAdjustments();

    // Poll every 30 seconds
    const interval = setInterval(fetchAdjustments, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "deposit":
        return <div className="badge badge-success">Deposit</div>;
      case "withdraw":
        return <div className="badge badge-error">Withdraw</div>;
      case "rebalance":
        return <div className="badge badge-info">Rebalance</div>;
      default:
        return <div className="badge badge-neutral">{type}</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Adjustment History</h2>
          <div className="flex items-center justify-center h-32">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Adjustment History</h2>

        {adjustments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-base-content/70">No adjustments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Token 0</th>
                  <th>Token 1</th>
                  <th>Bounds</th>
                  <th>Transaction</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.map(adjustment => (
                  <tr key={adjustment.id}>
                    <td>
                      <div className="text-sm">{formatTimestamp(adjustment.timestamp)}</div>
                    </td>
                    <td>{getTypeBadge(adjustment.type)}</td>
                    <td>
                      <div className="font-mono text-sm">{adjustment.token0Amount}</div>
                    </td>
                    <td>
                      <div className="font-mono text-sm">{adjustment.token1Amount}</div>
                    </td>
                    <td>
                      <div className="text-xs space-y-1">
                        <div>Lower: {adjustment.newLowerTick}</div>
                        <div>Upper: {adjustment.newUpperTick}</div>
                      </div>
                    </td>
                    <td>
                      <a
                        href={`https://arbiscan.io/tx/${adjustment.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary text-xs"
                      >
                        {adjustment.txHash.slice(0, 8)}...
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="card-actions justify-end mt-4">
          <button className="btn btn-outline btn-sm">View All History</button>
        </div>
      </div>
    </div>
  );
};
