"use client";

import { useEffect, useState } from "react";

// Real contract addresses for Arbitrum mainnet
const REAL_CONTRACT_ADDRESSES = {
  lpManager: "0x3b7b4EB1186B889Df55e9184738468CCE1a6703f", // LiquidityManager contract
  pool: "0xc664db6E6f902d5C1Acf73C659B95E4779CAedDE", // Pool address
  oracle: "0x4548Efa0b65C27eddFB6F444AaC984F416130b08", // Oracle address
  token0: "0xF197FFC28c23E0309B5559e7a166f2c6164C80aA", // MXNb
  token1: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT0
};

export const ContractLinks = () => {
  const [contracts, setContracts] = useState(REAL_CONTRACT_ADDRESSES);

  useEffect(() => {
    // Use real contract addresses
    setContracts(REAL_CONTRACT_ADDRESSES);
  }, []);

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getArbiscanUrl = (address: string) => {
    return `https://arbiscan.io/address/${address}`;
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
          {/* Liquidity Manager */}
          <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="badge badge-primary border-accent text-sm">Manager</div>
              <span className="text-sm font-medium dark:text-white">Liquidity Manager</span>
            </div>
            <a
              href={getArbiscanUrl(contracts.lpManager)}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary text-xs font-mono dark:text-white"
            >
              {shortenAddress(contracts.lpManager)}
            </a>
          </div>

          {/* Token0 (MXNb) */}
          <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="badge badge-secondary border-accent text-sm">Token0</div>
              <span className="text-sm font-medium dark:text-white">MXNb</span>
            </div>
            <a
              href={getArbiscanUrl(contracts.token0)}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary text-xs font-mono dark:text-white"
            >
              {shortenAddress(contracts.token0)}
            </a>
          </div>

          {/* Token1 (USDT0) */}
          <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="badge badge-accent">Token1</div>
              <span className="text-sm font-medium dark:text-white">USDT0</span>
            </div>
            <a
              href={getArbiscanUrl(contracts.token1)}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary text-xs font-mono dark:text-white"
            >
              {shortenAddress(contracts.token1)}
            </a>
          </div>

          {/* Pool */}
          <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="badge badge-info border-accent text-sm dark:text-white">Pool</div>
              <span className="text-sm font-medium dark:text-white">Pool Contract</span>
            </div>
            <a
              href={getArbiscanUrl(contracts.pool)}
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
              <div className="badge badge-warning border-accent text-sm">Oracle</div>
              <span className="text-sm font-medium dark:text-white">Price Oracle</span>
            </div>
            <a
              href={getArbiscanUrl(contracts.oracle)}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary text-xs font-mono dark:text-white"
            >
              {shortenAddress(contracts.oracle)}
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
