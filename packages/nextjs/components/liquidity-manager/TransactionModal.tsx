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

  // Error states
  const [token0Error, setToken0Error] = useState<string | null>(null);
  const [token1Error, setToken1Error] = useState<string | null>(null);
  const [sharesError, setSharesError] = useState<string | null>(null);

  // Approval states
  const [token0Allowance, setToken0Allowance] = useState("0");
  const [token1Allowance, setToken1Allowance] = useState("0");
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [approvingToken, setApprovingToken] = useState<"token0" | "token1" | "both" | null>(null);

  const { data: approvalResult, writeContractAsync: approveToken } = useWriteContract();
  const { data: depositResult, writeContractAsync: deposit } = useWriteContract();
  const { data: withdrawResult, writeContractAsync: withdraw } = useWriteContract();

  // Wait for transaction confirmations
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approvalResult,
  });

  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({
    hash: depositResult,
  });

  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({
    hash: withdrawResult,
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

  // Removed deposit0Max, deposit1Max, activeDepositorWhitelist, and approvedDepositor reads as per instructions.

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

  useEffect(() => {
    if (sharesBalance && typeof sharesBalance === "bigint" && sharesAmount) {
      const balance = parseFloat(formatUnits(sharesBalance, 6)); // LP tokens have 18 decimals
      const amount = parseFloat(sharesAmount);
      if (amount > balance) {
        setSharesError("Insufficient LP token balance");
      } else {
        setSharesError(null);
      }
    }
  }, [sharesAmount, sharesBalance]);

  // Handle approval success
  useEffect(() => {
    if (isApprovalSuccess) {
      setIsApproving(false);
      setApprovingToken(null);
      // Don't refresh page, just let the user proceed to deposit
      // The approval state will be updated automatically by the allowance hooks
    }
  }, [isApprovalSuccess]);

  // Handle deposit success
  useEffect(() => {
    if (isDepositSuccess) {
      setIsExecuting(false);
      // Reset form
      setToken0Amount("");
      setToken1Amount("");
      // Refresh the page to update balances
      window.location.reload();
    }
  }, [isDepositSuccess]);

  // Handle withdraw success
  useEffect(() => {
    if (isWithdrawSuccess) {
      setIsExecuting(false);
      // Reset form
      setSharesAmount("");
      // Refresh the page to update balances
      window.location.reload();
    }
  }, [isWithdrawSuccess]);

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

      // Check which tokens need approval
      const needsToken0Approval = token0AmountNum > token0AllowanceNum && token0AmountNum > 0;
      const needsToken1Approval = token1AmountNum > token1AllowanceNum && token1AmountNum > 0;

      // Send both approval transactions back-to-back if both are needed
      if (needsToken0Approval && needsToken1Approval) {
        setApprovingToken("both");
        console.log("Approving both tokens...");

        // Approve token0 first
        await approveToken({
          address: TOKEN0_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACT_ADDRESS as `0x${string}`, token0ApprovalWithBuffer],
        });

        // Then approve token1
        await approveToken({
          address: TOKEN1_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACT_ADDRESS as `0x${string}`, token1ApprovalWithBuffer],
        });
      } else if (needsToken0Approval) {
        // Only token0 needs approval
        setApprovingToken("token0");
        console.log("Approving token0:", {
          address: TOKEN0_ADDRESS,
          spender: CONTRACT_ADDRESS,
          amount: token0ApprovalWithBuffer.toString(),
        });

        await approveToken({
          address: TOKEN0_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACT_ADDRESS as `0x${string}`, token0ApprovalWithBuffer],
        });
      } else if (needsToken1Approval) {
        // Only token1 needs approval
        setApprovingToken("token1");
        console.log("Approving token1:", {
          address: TOKEN1_ADDRESS,
          spender: CONTRACT_ADDRESS,
          amount: token1ApprovalWithBuffer.toString(),
        });

        await approveToken({
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
    } catch (error) {
      console.error("Deposit failed:", error);
      setIsExecuting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!accountAddress) return;

    setIsExecuting(true);
    try {
      const shares = parseUnits(sharesAmount, 6);

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
      setSharesAmount(formatUnits(sharesBalance, 6));
    }
  };

  const handleClose = () => {
    setToken0Amount("");
    setToken1Amount("");
    setSharesAmount("");
    setIsApproving(false);
    setIsExecuting(false);
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
                  ? `Confirming ${approvingToken === "token0" ? "MXNb" : approvingToken === "token1" ? "USDT0" : "Both Tokens"} Approval...`
                  : isApproving
                    ? `Approving ${approvingToken === "token0" ? "MXNb" : approvingToken === "token1" ? "USDT0" : "Both Tokens"}...`
                    : isDepositConfirming
                      ? "Confirming Deposit..."
                      : isExecuting
                        ? "Depositing..."
                        : requiresApproval
                          ? "Approve"
                          : "Deposit"}
              </button>
            </div>
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
                  Balance: {sharesBalance && typeof sharesBalance === "bigint" ? formatUnits(sharesBalance, 6) : "0"}
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
