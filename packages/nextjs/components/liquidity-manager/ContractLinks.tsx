"use client";

import { useEffect, useState } from "react";
import { MOCK_CONTRACT_ADDRESSES } from "~~/utils/mockData";

export const ContractLinks = () => {
  const [contracts, setContracts] = useState(MOCK_CONTRACT_ADDRESSES);

  useEffect(() => {
    // In a real app, you would fetch contract addresses here
    // For now, we just use the mock data
    setContracts(MOCK_CONTRACT_ADDRESSES);
  }, []);

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getEtherscanUrl = (address: string) => {
    return `https://etherscan.io/address/${address}`;
  };

  return (
    <div className="card shadow-xl bg-primary dark:bg-neutral dark:text-primary">
      <div className="card-body">
        <h3 className="card-title">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Contract Addresses
        </h3>

        <div className="space-y-3">
          {/* LP Token */}
          <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="badge badge-primary border-accent text-sm">LP</div>
              <span className="text-sm font-medium dark:text-white">LP Token</span>
            </div>
            <a
              href={getEtherscanUrl(contracts.lpToken)}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary text-xs font-mono dark:text-white"
            >
              {shortenAddress(contracts.lpToken)}
            </a>
          </div>

          {/* Pool */}
          <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="badge badge-secondary border-accent text-sm">Pool</div>
              <span className="text-sm font-medium dark:text-white">Pool Contract</span>
            </div>
            <a
              href={getEtherscanUrl(contracts.pool)}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary text-xs font-mono dark:text-white"
            >
              {shortenAddress(contracts.pool)}
            </a>
          </div>

          {/* Oracle */}
          <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="badge badge-accent">Oracle</div>
              <span className="text-sm font-medium dark:text-white">Price Oracle</span>
            </div>
            <a
              href={getEtherscanUrl(contracts.oracle)}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary text-xs font-mono dark:text-white"
            >
              {shortenAddress(contracts.oracle)}
            </a>
          </div>

          {/* Manager */}
          <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="badge badge-info border-accent text-sm dark:text-white">Manager</div>
              <span className="text-sm font-medium dark:text-white">Liquidity Manager</span>
            </div>
            <a
              href={getEtherscanUrl(contracts.manager)}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary text-xs font-mono dark:text-white"
            >
              {shortenAddress(contracts.manager)}
            </a>
          </div>
        </div>

        <div className="card-actions justify-end mt-4">
          <button className="btn btn-outline btn-sm">Copy All Addresses</button>
        </div>
      </div>
    </div>
  );
};
