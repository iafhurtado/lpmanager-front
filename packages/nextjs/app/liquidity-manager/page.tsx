"use client";

import { useState } from "react";
import { AdjustmentHistory } from "~~/components/liquidity-manager/AdjustmentHistory";
import { ContractLinks } from "~~/components/liquidity-manager/ContractLinks";
import { LiquidityCards } from "~~/components/liquidity-manager/LiquidityCards";
import { PriceChart } from "~~/components/liquidity-manager/PriceChart";
import { PriceMetrics } from "~~/components/liquidity-manager/PriceMetrics";
import { TransactionModal } from "~~/components/liquidity-manager/TransactionModal";

export default function LiquidityManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"deposit" | "withdraw">("deposit");

  const handleOpenModal = (action: "deposit" | "withdraw") => {
    setModalAction(action);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-base-100">
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2 dark:text-white">Liquidity Manager</h1>
          <p className="text-base-content/70">Manage your on-chain liquidity positions</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => handleOpenModal("deposit")} className="btn btn-primary btn-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Deposit
          </button>
          <button onClick={() => handleOpenModal("withdraw")} className="btn btn-outline btn-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
            Withdraw
          </button>
        </div>

        {/* Price Chart */}
        <div className="w-full">
          <PriceChart />
        </div>

        {/* Price Metrics and Contract Links - Compact Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PriceMetrics />
          <ContractLinks />
        </div>

        {/* Liquidity Cards */}
        <LiquidityCards />

        {/* Adjustment History */}
        <AdjustmentHistory />
      </main>

      {/* Transaction Modal */}
      <TransactionModal isOpen={isModalOpen} onClose={handleCloseModal} action={modalAction} />
    </div>
  );
}
