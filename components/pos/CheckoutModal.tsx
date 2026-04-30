"use client";

import { useState } from "react";
import { X, Banknote, CreditCard, QrCode } from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import { useCartStore } from "@/lib/store";
import PaymentCash from "./PaymentCash";

type PaymentMethod = "CASH" | "CARD";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (orderData: OrderPayload) => void;
  isProcessing: boolean;
}

export interface OrderPayload {
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  subtotal: number;
  discountValue: number;
  discountType: "PERCENT" | "FIXED";
  taxRate: number;
  taxAmount: number;
  total: number;
  note: string;
  cashierName: string;
  customerId?: string | null;
  items: {
    variantId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    snapshot: {
      name: string;
      size: string;
      color: string;
      colorHex?: string;
    };
  }[];
}

const paymentMethods = [
  { value: "CASH" as PaymentMethod, label: "Tunai", icon: Banknote, desc: "Bayar dengan uang tunai" },
  { value: "CARD" as PaymentMethod, label: "Kartu", icon: CreditCard, desc: "Debit / Kredit" },
];

export default function CheckoutModal({
  open,
  onClose,
  onComplete,
  isProcessing,
}: CheckoutModalProps) {
  const {
    items,
    discount,
    discountType,
    taxEnabled,
    note,
    cashierName,
    getSubtotal,
    getDiscountAmount,
    getTaxAmount,
    getTotal,
    customerId,
  } = useCartStore();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );

  if (!open) return null;

  const total = getTotal();

  const buildPayload = (
    method: PaymentMethod,
    cashReceived?: number
  ): OrderPayload => ({
    paymentMethod: method,
    cashReceived,
    subtotal: getSubtotal(),
    discountValue: discount,
    discountType,
    taxRate: taxEnabled ? 0.11 : 0,
    taxAmount: getTaxAmount(),
    total,
    note,
    cashierName,
    customerId,
    items: items.map((item) => ({
      variantId: item.variantId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.unitPrice * item.quantity,
      snapshot: {
        name: item.name,
        size: item.size,
        color: item.color,
        colorHex: item.colorHex,
      },
    })),
  });

  const handleCashConfirm = (received: number) => {
    onComplete(buildPayload("CASH", received));
  };

  const handleCardConfirm = () => {
    onComplete(buildPayload("CARD"));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto animate-slide-up md:animate-scale-in shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            {selectedMethod ? "Pembayaran" : "Pilih Metode Bayar"}
          </h2>
          <button
            onClick={selectedMethod ? () => setSelectedMethod(null) : onClose}
            className="w-8 h-8 rounded-full bg-background flex items-center justify-center hover:bg-navy-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-muted">
                Memproses pembayaran...
              </p>
            </div>
          ) : !selectedMethod ? (
            /* Method Selection */
            <div className="space-y-3">
              {/* Order Summary */}
              <div className="bg-background rounded-xl p-4 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted">
                    {items.length} item ({items.reduce((a, i) => a + i.quantity, 0)} pcs)
                  </span>
                  <span className="font-mono">{formatRupiah(getSubtotal())}</span>
                </div>
                {getDiscountAmount() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Diskon</span>
                    <span className="font-mono text-danger">
                      -{formatRupiah(getDiscountAmount())}
                    </span>
                  </div>
                )}
                {getTaxAmount() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">PPN 11%</span>
                    <span className="font-mono">{formatRupiah(getTaxAmount())}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 mt-2 border-t border-border">
                  <span>TOTAL</span>
                  <span className="font-mono text-emerald-500">
                    {formatRupiah(total)}
                  </span>
                </div>
              </div>

              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  onClick={() => setSelectedMethod(method.value)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-navy-400 hover:bg-navy-50/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center">
                    <method.icon className="w-6 h-6 text-navy-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">
                      {method.label}
                    </p>
                    <p className="text-xs text-muted">{method.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : selectedMethod === "CASH" ? (
            <PaymentCash total={total} onConfirm={handleCashConfirm} />
          ) : (
            /* CARD payment */
            <div className="space-y-4 animate-fade-in">
              <div className="bg-navy-50 rounded-xl p-4 text-center">
                <CreditCard className="w-12 h-12 text-navy-400 mx-auto mb-2" />
                <p className="text-sm text-muted mb-1">
                  Total Pembayaran
                </p>
                <p className="text-2xl font-mono font-bold text-navy-600">
                  {formatRupiah(total)}
                </p>
                <p className="text-xs text-muted mt-2">
                  Gesek kartu debit/kredit pada mesin EDC
                </p>
              </div>
              <button
                onClick={handleCardConfirm}
                className="w-full h-12 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-400/25 active:scale-[0.98] transition-all"
              >
                <CreditCard className="w-5 h-5" />
                Konfirmasi Pembayaran Kartu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
