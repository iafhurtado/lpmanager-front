"use client";

import { useState } from "react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "deposit" | "withdraw";
}

export const TransactionModal = ({ isOpen, onClose, type }: TransactionModalProps) => {
  const [token0Amount, setToken0Amount] = useState("");
  const [token1Amount, setToken1Amount] = useState("");
  const [, setIsApproving] = useState(false);
  const [, setIsExecuting] = useState(false);
  const [step, setStep] = useState<"input" | "approve" | "execute" | "success">("input");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token0Amount || !token1Amount) {
      alert("Please enter amounts for both tokens");
      return;
    }

    setStep("approve");
    setIsApproving(true);

    try {
      // Simulate approval process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsApproving(false);
      setStep("execute");
      setIsExecuting(true);

      // Simulate transaction execution
      await new Promise(resolve => setTimeout(resolve, 3000));

      setIsExecuting(false);
      setStep("success");

      // Reset form after success
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error) {
      console.error("Transaction failed:", error);
      setIsApproving(false);
      setIsExecuting(false);
      setStep("input");
      alert("Transaction failed. Please try again.");
    }
  };

  const handleClose = () => {
    setToken0Amount("");
    setToken1Amount("");
    setStep("input");
    setIsApproving(false);
    setIsExecuting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-lg mb-4">{type === "deposit" ? "Deposit Liquidity" : "Withdraw Liquidity"}</h3>

        {step === "input" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Token 0 Amount (USDC)</span>
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="input input-bordered w-full"
                value={token0Amount}
                onChange={e => setToken0Amount(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Token 1 Amount (ETH)</span>
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="input input-bordered w-full"
                value={token1Amount}
                onChange={e => setToken1Amount(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>

            <div className="modal-action">
              <button type="button" className="btn" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {type === "deposit" ? "Deposit" : "Withdraw"}
              </button>
            </div>
          </form>
        )}

        {step === "approve" && (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
            <p className="text-center">Approving tokens...</p>
            <div className="modal-action">
              <button className="btn btn-disabled" disabled>
                Approving...
              </button>
            </div>
          </div>
        )}

        {step === "execute" && (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
            <p className="text-center">Executing transaction...</p>
            <div className="modal-action">
              <button className="btn btn-disabled" disabled>
                Processing...
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="text-success">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-center text-success font-semibold">
              {type === "deposit" ? "Deposit successful!" : "Withdrawal successful!"}
            </p>
            <div className="modal-action">
              <button className="btn btn-success" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="modal-backdrop" onClick={handleClose}></div>
    </div>
  );
};
