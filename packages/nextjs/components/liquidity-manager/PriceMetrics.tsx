"use client";

import { useEffect, useState } from "react";
import { getMockPriceData } from "~~/utils/mockData";

export const PriceMetrics = () => {
  const [priceData, setPriceData] = useState(getMockPriceData());

  useEffect(() => {
    // Poll every 15 seconds
    const interval = setInterval(() => {
      setPriceData(getMockPriceData());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

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
          <p className="text-lg text-white dark:text-primary">
            {new Date(priceData.oracleTimestamp).toLocaleTimeString()}
          </p>
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
          <p className="text-lg text-white dark:text-primary">
            {new Date(priceData.poolTimestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Price Difference */}
      <div className="card shadow-sm bg-primary dark:bg-neutral dark:text-primary">
        <div className="card-body p-3">
          <h3 className="card-title text-lg mb-1 text-white dark:text-primary">Difference</h3>
          <p className="text-4xl font-bold text-white dark:text-primary">${priceData.priceDifference.toFixed(4)}</p>
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
