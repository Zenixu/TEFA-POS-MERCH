"use client";

import { AlertTriangle } from "lucide-react";

interface LowStockAlertProps {
  data: {
    id: string;
    size: string;
    color: string;
    stock: number;
    product: { name: string };
  }[];
}

export default function LowStockAlert({ data }: LowStockAlertProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-warning" />
        Stok Menipis
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted text-center py-6">
          ✅ Semua stok aman
        </p>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {data.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between text-sm py-2 border-b border-border/60 last:border-0"
            >
              <div>
                <p className="font-medium text-foreground">
                  {v.product.name}
                </p>
                <p className="text-xs text-muted">
                  {v.color} · {v.size}
                </p>
              </div>
              <span
                className={`font-mono font-bold text-sm ${
                  v.stock === 0 ? "text-danger" : "text-warning"
                }`}
              >
                {v.stock === 0 ? "HABIS" : `${v.stock} pcs`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
