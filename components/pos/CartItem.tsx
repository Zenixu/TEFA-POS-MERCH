"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { useCartStore, type CartItem as CartItemType } from "@/lib/store";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQty, removeItem } = useCartStore();

  return (
    <div className="flex gap-3 py-3 border-b border-border/60 last:border-0 animate-fade-in">
      {/* Color indicator */}
      <div className="flex flex-col items-center gap-1 pt-1">
        <div
          className="w-6 h-6 rounded-full border-2 border-border flex-shrink-0"
          style={{
            backgroundColor: item.colorHex || "#ccc",
            borderColor:
              item.colorHex?.toLowerCase() === "#ffffff" ? "#E2E8F0" : "transparent",
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground truncate">
          {item.name}
        </h4>
        <p className="text-xs text-muted">
          {item.color} · {item.size}
        </p>
        <p className="font-mono text-sm font-bold text-emerald-400 mt-0.5">
          {formatRupiah(item.unitPrice)}
        </p>
      </div>

      {/* Qty Controls */}
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={() => removeItem(item.variantId)}
          className="text-muted hover:text-danger transition-colors p-0.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => updateQty(item.variantId, item.quantity - 1)}
            className="w-7 h-7 rounded-md bg-background border border-border flex items-center justify-center hover:bg-navy-50 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="font-mono text-sm font-bold w-6 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQty(item.variantId, item.quantity + 1)}
            disabled={item.quantity >= item.maxStock}
            className="w-7 h-7 rounded-md bg-background border border-border flex items-center justify-center hover:bg-navy-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <span className="font-mono text-xs text-muted">
          {formatRupiah(item.unitPrice * item.quantity)}
        </span>
      </div>
    </div>
  );
}
