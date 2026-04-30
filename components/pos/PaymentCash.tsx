"use client";

import { useState } from "react";
import { formatRupiah, cn } from "@/lib/utils";
import { QUICK_DENOMINATION } from "@/lib/constants";
import { Banknote, Calculator } from "lucide-react";

interface PaymentCashProps {
  total: number;
  onConfirm: (received: number) => void;
}

export default function PaymentCash({ total, onConfirm }: PaymentCashProps) {
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [inputValue, setInputValue] = useState("");

  const changeAmount = cashReceived - total;
  const isValid = cashReceived >= total;

  const handleDenomination = (amount: number) => {
    setCashReceived(amount);
    setInputValue(amount.toString());
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
    setCashReceived(parseFloat(val) || 0);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Amount Input */}
      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">
          Uang Diterima
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted font-mono">
            Rp
          </span>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="0"
            autoFocus
            className="w-full h-14 pl-10 pr-4 rounded-xl bg-background border-2 border-border text-2xl font-mono font-bold text-right focus:outline-none focus:ring-2 focus:ring-navy-400/40 focus:border-navy-400"
          />
        </div>
      </div>

      {/* Quick Denominations */}
      <div className="flex flex-wrap gap-2">
        {QUICK_DENOMINATION.map((amount) => (
          <button
            key={amount}
            onClick={() => handleDenomination(amount)}
            className={cn(
              "px-3 py-2 rounded-lg font-mono text-sm font-medium border transition-all",
              cashReceived === amount
                ? "bg-navy-600 text-white border-navy-600"
                : "bg-white text-foreground border-border hover:border-navy-300 hover:bg-navy-50"
            )}
          >
            {formatRupiah(amount)}
          </button>
        ))}
        <button
          onClick={() => handleDenomination(total)}
          className="px-3 py-2 rounded-lg font-mono text-sm font-medium border border-emerald-400 text-emerald-500 bg-emerald-50 hover:bg-emerald-100 transition-all"
        >
          Uang Pas
        </button>
      </div>

      {/* Change Calculation */}
      {cashReceived > 0 && (
        <div
          className={cn(
            "rounded-xl p-4 animate-fade-in",
            isValid
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-red-50 border border-red-200"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-muted" />
            <span className="text-sm font-medium text-muted">
              Perhitungan
            </span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Total Belanja</span>
              <span className="font-mono font-medium">
                {formatRupiah(total)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Uang Diterima</span>
              <span className="font-mono font-medium">
                {formatRupiah(cashReceived)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-current/10 text-base font-bold">
              <span>{isValid ? "Kembalian" : "Kurang"}</span>
              <span
                className={cn(
                  "font-mono",
                  isValid ? "text-emerald-600" : "text-danger"
                )}
              >
                {formatRupiah(Math.abs(changeAmount))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Confirm */}
      <button
        onClick={() => isValid && onConfirm(cashReceived)}
        disabled={!isValid}
        className={cn(
          "w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
          isValid
            ? "bg-emerald-400 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-400/25 active:scale-[0.98]"
            : "bg-border text-muted cursor-not-allowed"
        )}
      >
        <Banknote className="w-5 h-5" />
        {isValid ? "Konfirmasi Pembayaran Tunai" : "Masukkan nominal yang cukup"}
      </button>
    </div>
  );
}
