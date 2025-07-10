"use client";

import React, { useEffect, useState } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import dayjs from "dayjs";
import { Line } from "react-chartjs-2";
import { useReadContract } from "wagmi";
import { lpManagerAbi } from "~~/app/liquidity-manager/lpmanager-abi";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Token addresses and decimals
const token0Address = "0xF197FFC28c23E0309B5559e7a166f2c6164C80aA"; // MXNb
const token1Address = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"; // USDT0
const TOKEN0_DECIMALS = 6; // MXNb has 6 decimals
const TOKEN1_DECIMALS = 6; // USDT0 has 6 decimals
const CONTRACT_ADDRESS = "0x3b7b4EB1186B889Df55e9184738468CCE1a6703f"; // LiquidityManager contract address

interface PriceDataPoint {
  timestamp: number;
  price: number;
}

export const PriceChart = () => {
  const [timePeriod, setTimePeriod] = useState<"1month" | "6months" | "1year">("1month");
  const [isMobile, setIsMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [priceHistory, setPriceHistory] = useState<PriceDataPoint[]>([]);

  // Amount for price calculation (1 MXNb)
  const AMOUNT_IN = BigInt(10 ** TOKEN0_DECIMALS);

  // Pool spot price call
  const { data: spotAmountOut, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: lpManagerAbi,
    functionName: "fetchSpot",
    args: [token1Address as `0x${string}`, token0Address as `0x${string}`, AMOUNT_IN],
  });

  // Check if we're on mobile after component mounts and set current time
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };

    checkMobile();
    updateTime();
    window.addEventListener("resize", checkMobile);

    // Update time every second
    const timeInterval = setInterval(updateTime, 1000);

    return () => {
      window.removeEventListener("resize", checkMobile);
      clearInterval(timeInterval);
    };
  }, []);

  // Update price history when new spot price is available
  useEffect(() => {
    if (spotAmountOut !== undefined && spotAmountOut !== null) {
      const currentPrice = Number(spotAmountOut) / 10 ** TOKEN1_DECIMALS;
      const newDataPoint: PriceDataPoint = {
        timestamp: Date.now(),
        price: currentPrice,
      };

      setPriceHistory(prev => {
        const updated = [...prev, newDataPoint];

        // Keep only data points within the selected time period
        const timeLimit =
          timePeriod === "1month"
            ? 30 * 24 * 60 * 60 * 1000
            : timePeriod === "6months"
              ? 6 * 30 * 24 * 60 * 60 * 1000
              : 12 * 30 * 24 * 60 * 60 * 1000;

        const cutoffTime = Date.now() - timeLimit;
        return updated.filter(point => point.timestamp > cutoffTime);
      });
    }
  }, [spotAmountOut, timePeriod]);

  // Sample data based on time period to avoid overcrowding
  const sampledData =
    timePeriod === "1month"
      ? priceHistory.slice(-30)
      : timePeriod === "6months"
        ? priceHistory.slice(-60)
        : priceHistory.slice(-90);

  const chartLabels = sampledData.map(d => dayjs(d.timestamp).format("MMM D, HH:mm"));

  const chartValues = sampledData.map(d => d.price);

  const currentPrice = chartValues[chartValues.length - 1] || 0;

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Pool Price",
        data: chartValues,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 12,
          padding: 8,
          font: {
            size: isMobile ? 10 : 12,
          },
        },
      },
      title: {
        display: true,
        text: "Pool Price History",
        font: {
          size: isMobile ? 14 : 16,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: isMobile ? 8 : 10,
          },
        },
        grid: {
          display: !isMobile,
        },
      },
      y: {
        ticks: {
          font: {
            size: isMobile ? 8 : 10,
          },
          callback: function (value: any) {
            return `$${Number(value).toFixed(4)}`;
          },
        },
        grid: {
          display: !isMobile,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    elements: {
      point: {
        radius: isMobile ? 2 : 4,
        hoverRadius: isMobile ? 4 : 6,
      },
      line: {
        borderWidth: isMobile ? 1 : 2,
      },
    },
  };

  const handleTimePeriodChange = (period: "1month" | "6months" | "1year") => {
    setTimePeriod(period);
  };

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Price Chart</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleTimePeriodChange("1month")}
              className={`btn btn-xs ${timePeriod === "1month" ? "btn-primary" : "btn-outline"}`}
            >
              1M
            </button>
            <button
              onClick={() => handleTimePeriodChange("6months")}
              className={`btn btn-xs ${timePeriod === "6months" ? "btn-primary" : "btn-outline"}`}
            >
              6M
            </button>
            <button
              onClick={() => handleTimePeriodChange("1year")}
              className={`btn btn-xs ${timePeriod === "1year" ? "btn-primary" : "btn-outline"}`}
            >
              1Y
            </button>
          </div>
        </div>

        <div className="h-64 md:h-80 lg:h-96">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : priceHistory.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-center text-base-content/70">No price data available</p>
            </div>
          ) : (
            <Line data={chartData} options={options} />
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm">
            <span className="text-base-content/70">Current Price: </span>
            <span className="font-bold text-primary dark:text-white text-2xl">${currentPrice.toFixed(2)}</span>
          </div>
          <div className="text-xs text-base-content/50">Last updated: {currentTime || "..."}</div>
        </div>
      </div>
    </div>
  );
};
