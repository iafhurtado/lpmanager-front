"use client";

import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { lpManagerAbi } from "~~/app/liquidity-manager/lpmanager-abi";

// Contract configuration
const CONTRACT_ADDRESS = "0x3b7b4EB1186B889Df55e9184738468CCE1a6703f";
const TOKEN0_ADDRESS = "0xF197FFC28c23E0309B5559e7a166f2c6164C80aA"; // MXNb
const TOKEN1_ADDRESS = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"; // USDT0
const TOKEN0_DECIMALS = 6; // MXNb has 6 decimals
const TOKEN1_DECIMALS = 6; // USDT0 has 6 decimals

// ERC20 ABI for approvals
const ERC20_ABI = [
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: "deposit" | "withdraw";
}

export const TransactionModal = ({ isOpen, onClose, action }: TransactionModalProps) => {
  const { address: accountAddress } = useAccount();

  // Input states
  const [token0Amount, setToken0Amount] = useState("");
  const [token1Amount, setToken1Amount] = useState("");
  const [sharesAmount, setSharesAmount] = useState("");

  // Loading states
  const [isApproving, setIsApproving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Transaction hashes for confirmation
  const [approvalTxHash, setApprovalTxHash] = useState<string | null>(null);
  const [depositTxHash, setDepositTxHash] = useState<string | null>(null);
  const [withdrawTxHash, setWithdrawTxHash] = useState<string | null>(null);

  // Error states
  const [token0Error, setToken0Error] = useState<string | null>(null);
  const [token1Error, setToken1Error] = useState<string | null>(null);
  const [sharesError, setSharesError] = useState<string | null>(null);

  // Approval states
  const [token0Allowance, setToken0Allowance] = useState("0");
  const [token1Allowance, setToken1Allowance] = useState("0");
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [approvingToken, setApprovingToken] = useState<"token0" | "token1" | null>(null);

  const { writeContract: approveToken } = useWriteContract();
  const { writeContract: deposit } = useWriteContract();
  const { writeContract: withdraw } = useWriteContract();

  // Wait for transaction confirmations
  const { isLoading: isApprovalConfirming } = useWaitForTransactionReceipt({
    hash: approvalTxHash as `0x${string}`,
  });

  const { isLoading: isDepositConfirming } = useWaitForTransactionReceipt({
    hash: depositTxHash as `0x${string}`,
  });

  const { isLoading: isWithdrawConfirming } = useWaitForTransactionReceipt({
    hash: withdrawTxHash as `0x${string}`,
  });

  // Read token balances
  const { data: token0Balance } = useReadContract({
    address: TOKEN0_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [accountAddress],
  });

  const { data: token1Balance } = useReadContract({
    address: TOKEN1_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [accountAddress],
  });

  // Read LP token balance
  const { data: sharesBalance } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: lpManagerAbi,
    functionName: "balanceOf",
    args: [accountAddress],
  });

  // Read deposit maximums
  const { data: deposit0Max } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: lpManagerAbi,
    functionName: "deposit0Max",
  });

  const { data: deposit1Max } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: lpManagerAbi,
    functionName: "deposit1Max",
  });

  // Read whitelist status
  const { data: activeDepositorWhitelist } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: lpManagerAbi,
    functionName: "activeDepositorWhitelist",
  });

  const { data: approvedDepositor } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: lpManagerAbi,
    functionName: "approvedDepositor",
    args: [accountAddress],
  });

  // Read token0 allowance
  const { data: token0AllowanceData } = useReadContract({
    address: TOKEN0_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [accountAddress, CONTRACT_ADDRESS as `0x${string}`],
  });

  // Read token1 allowance
  const { data: token1AllowanceData } = useReadContract({
    address: TOKEN1_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [accountAddress, CONTRACT_ADDRESS as `0x${string}`],
  });

  // Update allowance states
  useEffect(() => {
    if (token0AllowanceData && typeof token0AllowanceData === "bigint") {
      setToken0Allowance(formatUnits(token0AllowanceData, TOKEN0_DECIMALS));
    }
  }, [token0AllowanceData]);

  useEffect(() => {
    if (token1AllowanceData && typeof token1AllowanceData === "bigint") {
      setToken1Allowance(formatUnits(token1AllowanceData, TOKEN1_DECIMALS));
    }
  }, [token1AllowanceData]);

  // Check if approval is needed
  useEffect(() => {
    if (action === "deposit") {
      const token0AmountNum = parseFloat(token0Amount) || 0;
      const token1AmountNum = parseFloat(token1Amount) || 0;
      const token0AllowanceNum = parseFloat(token0Allowance) || 0;
      const token1AllowanceNum = parseFloat(token1Allowance) || 0;

      const needsApproval = token0AmountNum > token0AllowanceNum || token1AmountNum > token1AllowanceNum;
      setRequiresApproval(needsApproval);
    }
  }, [token0Amount, token1Amount, token0Allowance, token1Allowance, action]);

  // Validate balances
  useEffect(() => {
    if (token0Balance && typeof token0Balance === "bigint" && token0Amount) {
      const balance = parseFloat(formatUnits(token0Balance, TOKEN0_DECIMALS));
      const amount = parseFloat(token0Amount);
      if (amount > balance) {
        setToken0Error("Insufficient MXNb balance");
      } else {
        setToken0Error(null);
      }
    }
  }, [token0Amount, token0Balance]);

  useEffect(() => {
    if (token1Balance && typeof token1Balance === "bigint" && token1Amount) {
      const balance = parseFloat(formatUnits(token1Balance, TOKEN1_DECIMALS));
      const amount = parseFloat(token1Amount);
      if (amount > balance) {
        setToken1Error("Insufficient USDT0 balance");
      } else {
        setToken1Error(null);
      }
    }
  }, [token1Amount, token1Balance]);

  // Validate deposit maximums
  useEffect(() => {
    if (deposit0Max && typeof deposit0Max === "bigint" && token0Amount) {
      const maxAmount = parseFloat(formatUnits(deposit0Max, TOKEN0_DECIMALS));
      const amount = parseFloat(token0Amount);
      if (amount > maxAmount) {
        setToken0Error(`Exceeds maximum deposit of ${maxAmount.toFixed(6)} MXNb`);
      } else if (!token0Error || token0Error === "Insufficient MXNb balance") {
        setToken0Error(null);
      }
    }
  }, [token0Amount, deposit0Max, token0Error]);

  useEffect(() => {
    if (deposit1Max && typeof deposit1Max === "bigint" && token1Amount) {
      const maxAmount = parseFloat(formatUnits(deposit1Max, TOKEN1_DECIMALS));
      const amount = parseFloat(token1Amount);
      if (amount > maxAmount) {
        setToken1Error(`Exceeds maximum deposit of ${maxAmount.toFixed(6)} USDT0`);
      } else if (!token1Error || token1Error === "Insufficient USDT0 balance") {
        setToken1Error(null);
      }
    }
  }, [token1Amount, deposit1Max, token1Error]);

  useEffect(() => {
    if (sharesBalance && typeof sharesBalance === "bigint" && sharesAmount) {
      const balance = parseFloat(formatUnits(sharesBalance, 18)); // LP tokens have 18 decimals
      const amount = parseFloat(sharesAmount);
      if (amount > balance) {
        setSharesError("Insufficient LP token balance");
      } else {
        setSharesError(null);
      }
    }
  }, [sharesAmount, sharesBalance]);

  // Reset approval state when approval is confirmed
  useEffect(() => {
    if (!isApprovalConfirming && approvalTxHash) {
      setApprovalTxHash(null);
      setIsApproving(false);
      setApprovingToken(null);
    }
  }, [isApprovalConfirming, approvalTxHash]);

  const handleApproval = async () => {
    if (!accountAddress) return;

    setIsApproving(true);
    try {
      const token0AmountNum = parseFloat(token0Amount) || 0;
      const token1AmountNum = parseFloat(token1Amount) || 0;
      const token0AllowanceNum = parseFloat(token0Allowance) || 0;
      const token1AllowanceNum = parseFloat(token1Allowance) || 0;

      // Calculate approval amounts - approve the exact amount needed
      const token0ApprovalAmount = parseUnits(token0Amount, TOKEN0_DECIMALS);
      const token1ApprovalAmount = parseUnits(token1Amount, TOKEN1_DECIMALS);

      // Add a small buffer to ensure sufficient allowance (1% extra)
      const token0ApprovalWithBuffer = (token0ApprovalAmount * 101n) / 100n;
      const token1ApprovalWithBuffer = (token1ApprovalAmount * 101n) / 100n;

      console.log("Approval amounts:", {
        token0Amount: token0Amount,
        token1Amount: token1Amount,
        token0ApprovalAmount: token0ApprovalAmount.toString(),
        token1ApprovalAmount: token1ApprovalAmount.toString(),
        token0ApprovalWithBuffer: token0ApprovalWithBuffer.toString(),
        token1ApprovalWithBuffer: token1ApprovalWithBuffer.toString(),
        token0Allowance: token0Allowance,
        token1Allowance: token1Allowance,
      });

      // Approve token0 if needed
      if (token0AmountNum > token0AllowanceNum && token0AmountNum > 0) {
        setApprovingToken("token0");
        console.log("Approving token0:", {
          address: TOKEN0_ADDRESS,
          spender: CONTRACT_ADDRESS,
          amount: token0ApprovalWithBuffer.toString(),
        });

        approveToken({
          address: TOKEN0_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACT_ADDRESS as `0x${string}`, token0ApprovalWithBuffer],
        });
        return; // Wait for this approval to complete before proceeding
      }

      // Approve token1 if needed
      if (token1AmountNum > token1AllowanceNum && token1AmountNum > 0) {
        setApprovingToken("token1");
        console.log("Approving token1:", {
          address: TOKEN1_ADDRESS,
          spender: CONTRACT_ADDRESS,
          amount: token1ApprovalWithBuffer.toString(),
        });

        approveToken({
          address: TOKEN1_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACT_ADDRESS as `0x${string}`, token1ApprovalWithBuffer],
        });
      }
    } catch (error) {
      console.error("Approval failed:", error);
      setIsApproving(false);
      setApprovingToken(null);
    }
  };

  const handleDeposit = async () => {
    if (!accountAddress) return;

    // Validate amounts
    const token0AmountNum = parseFloat(token0Amount) || 0;
    const token1AmountNum = parseFloat(token1Amount) || 0;

    if (token0AmountNum <= 0 || token1AmountNum <= 0) {
      console.error("Invalid deposit amounts:", { token0AmountNum, token1AmountNum });
      return;
    }

    // Check if approval is still needed
    if (requiresApproval) {
      console.error("Approval still required before deposit");
      return;
    }

    setIsExecuting(true);
    try {
      const deposit0 = parseUnits(token0Amount, TOKEN0_DECIMALS);
      const deposit1 = parseUnits(token1Amount, TOKEN1_DECIMALS);

      console.log("Depositing:", {
        contract: CONTRACT_ADDRESS,
        deposit0: deposit0.toString(),
        deposit1: deposit1.toString(),
        to: accountAddress,
        deposit0Max: deposit0Max?.toString(),
        deposit1Max: deposit1Max?.toString(),
        activeDepositorWhitelist,
        approvedDepositor,
        token0Allowance,
        token1Allowance,
        requiresApproval,
      });

      await deposit({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: lpManagerAbi,
        functionName: "deposit",
        args: [deposit0, deposit1, accountAddress],
      });

      console.log("Deposit transaction submitted");

      // Reset form after successful deposit
      setTimeout(() => {
        setToken0Amount("");
        setToken1Amount("");
        setDepositTxHash(null);
        setIsExecuting(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Deposit failed:", error);
      setIsExecuting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!accountAddress) return;

    setIsExecuting(true);
    try {
      const shares = parseUnits(sharesAmount, 18); // LP tokens have 18 decimals

      console.log("Withdrawing:", {
        contract: CONTRACT_ADDRESS,
        shares: shares.toString(),
        to: accountAddress,
      });

      await withdraw({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: lpManagerAbi,
        functionName: "withdraw",
        args: [shares, accountAddress],
      });

      console.log("Withdraw transaction submitted");

      // Reset form after successful withdraw
      setTimeout(() => {
        setSharesAmount("");
        setWithdrawTxHash(null);
        setIsExecuting(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Withdraw failed:", error);
      setIsExecuting(false);
    }
  };

  const handleMaxToken0 = () => {
    if (token0Balance && typeof token0Balance === "bigint") {
      setToken0Amount(formatUnits(token0Balance, TOKEN0_DECIMALS));
    }
  };

  const handleMaxToken1 = () => {
    if (token1Balance && typeof token1Balance === "bigint") {
      setToken1Amount(formatUnits(token1Balance, TOKEN1_DECIMALS));
    }
  };

  const handleMaxShares = () => {
    if (sharesBalance && typeof sharesBalance === "bigint") {
      setSharesAmount(formatUnits(sharesBalance, 18));
    }
  };

  const handleClose = () => {
    setToken0Amount("");
    setToken1Amount("");
    setSharesAmount("");
    setIsApproving(false);
    setIsExecuting(false);
    setApprovalTxHash(null);
    setDepositTxHash(null);
    setWithdrawTxHash(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-lg mb-4">{action === "deposit" ? "Deposit Liquidity" : "Withdraw Liquidity"}</h3>

        {action === "deposit" ? (
          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">MXNb Amount</span>
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="input input-bordered w-full"
                value={token0Amount}
                onChange={e => setToken0Amount(e.target.value)}
                step="0.000001"
                min="0"
              />
              <div className="flex justify-between text-sm mt-1">
                <span>
                  Balance:{" "}
                  {token0Balance && typeof token0Balance === "bigint"
                    ? formatUnits(token0Balance, TOKEN0_DECIMALS)
                    : "0"}
                </span>
                <button onClick={handleMaxToken0} className="text-primary hover:underline">
                  MAX
                </button>
              </div>
              {deposit0Max && typeof deposit0Max === "bigint" ? (
                <div className="text-xs text-base-content/60 mt-1">
                  Max deposit: {formatUnits(deposit0Max, TOKEN0_DECIMALS)} MXNb
                </div>
              ) : null}
              {token0Error && <p className="text-error text-sm mt-1">{token0Error}</p>}
            </div>

            <div>
              <label className="label">
                <span className="label-text">USDT0 Amount</span>
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="input input-bordered w-full"
                value={token1Amount}
                onChange={e => setToken1Amount(e.target.value)}
                step="0.000001"
                min="0"
              />
              <div className="flex justify-between text-sm mt-1">
                <span>
                  Balance:{" "}
                  {token1Balance && typeof token1Balance === "bigint"
                    ? formatUnits(token1Balance, TOKEN1_DECIMALS)
                    : "0"}
                </span>
                <button onClick={handleMaxToken1} className="text-primary hover:underline">
                  MAX
                </button>
              </div>
              {deposit1Max && typeof deposit1Max === "bigint" ? (
                <div className="text-xs text-base-content/60 mt-1">
                  Max deposit: {formatUnits(deposit1Max, TOKEN1_DECIMALS)} USDT0
                </div>
              ) : null}
              {token1Error && <p className="text-error text-sm mt-1">{token1Error}</p>}
            </div>

            <div className="modal-action">
              <button type="button" className="btn" onClick={handleClose}>
                Cancel
              </button>
              <button
                className={`btn ${requiresApproval ? "btn-warning" : "btn-primary"}`}
                onClick={requiresApproval ? handleApproval : handleDeposit}
                disabled={
                  isApproving ||
                  isExecuting ||
                  isApprovalConfirming ||
                  isDepositConfirming ||
                  !token0Amount ||
                  !token1Amount ||
                  !!token0Error ||
                  !!token1Error
                }
              >
                {isApprovalConfirming
                  ? `Confirming ${approvingToken === "token0" ? "MXNb" : "USDT0"} Approval...`
                  : isApproving
                    ? `Approving ${approvingToken === "token0" ? "MXNb" : "USDT0"}...`
                    : isDepositConfirming
                      ? "Confirming Deposit..."
                      : isExecuting
                        ? "Depositing..."
                        : requiresApproval
                          ? "Approve"
                          : "Deposit"}
              </button>
            </div>

            {/* Whitelist warning */}
            {activeDepositorWhitelist && typeof activeDepositorWhitelist === "boolean" && !approvedDepositor ? (
              <div className="alert alert-warning">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span>Depositor whitelist is active. You may not be able to deposit.</span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">LP Token Amount</span>
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="input input-bordered w-full"
                value={sharesAmount}
                onChange={e => setSharesAmount(e.target.value)}
                step="0.000001"
                min="0"
              />
              <div className="flex justify-between text-sm mt-1">
                <span>
                  Balance: {sharesBalance && typeof sharesBalance === "bigint" ? formatUnits(sharesBalance, 18) : "0"}
                </span>
                <button onClick={handleMaxShares} className="text-primary hover:underline">
                  MAX
                </button>
              </div>
              {sharesError && <p className="text-error text-sm mt-1">{sharesError}</p>}
            </div>

            <div className="modal-action">
              <button type="button" className="btn" onClick={handleClose}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleWithdraw}
                disabled={isExecuting || isWithdrawConfirming || !sharesAmount || !!sharesError}
              >
                {isWithdrawConfirming ? "Confirming Withdraw..." : isExecuting ? "Withdrawing..." : "Withdraw"}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="modal-backdrop" onClick={handleClose}></div>
    </div>
  );
};
