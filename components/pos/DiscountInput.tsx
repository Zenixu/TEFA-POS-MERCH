"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Percent, DollarSign } from "lucide-react";

export default function DiscountInput() {
  const { discount, discountType, setDiscount, taxEnabled, toggleTax, note, setNote } =
    useCartStore();
  const [localValue, setLocalValue] = useState(discount.toString());

  const handleChange = (val: string) => {
    setLocalValue(val);
    const num = parseFloat(val) || 0;
    setDiscount(num, discountType);
  };

  const handleTypeToggle = (type: "PERCENT" | "FIXED") => {
    setDiscount(discount, type);
  };

  return (
    <div className="space-y-3">
      {/* Discount */}
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 block">
          Diskon
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="number"
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              min={0}
              placeholder="0"
              className="w-full h-9 px-3 pr-8 rounded-lg bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-navy-400/40"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted">
              {discountType === "PERCENT" ? "%" : "Rp"}
            </span>
          </div>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => handleTypeToggle("PERCENT")}
              className={cn(
                "px-3 h-9 text-xs font-medium transition-colors",
                discountType === "PERCENT"
                  ? "bg-navy-600 text-white"
                  : "bg-white text-muted hover:bg-background"
              )}
            >
              <Percent className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleTypeToggle("FIXED")}
              className={cn(
                "px-3 h-9 text-xs font-medium transition-colors",
                discountType === "FIXED"
                  ? "bg-navy-600 text-white"
                  : "bg-white text-muted hover:bg-background"
              )}
            >
              <DollarSign className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* PPN Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">
          PPN 11%
        </label>
        <button
          onClick={toggleTax}
          className={cn(
            "w-10 h-6 rounded-full transition-colors relative",
            taxEnabled ? "bg-emerald-400" : "bg-border"
          )}
        >
          <span
            className={cn(
              "absolute w-4 h-4 rounded-full bg-white shadow-sm top-1 transition-all",
              taxEnabled ? "left-5" : "left-1"
            )}
          />
        </button>
      </div>

      {/* Note */}
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 block">
          Catatan
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Catatan untuk pesanan ini..."
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-navy-400/40"
        />
      </div>
    </div>
  );
}
