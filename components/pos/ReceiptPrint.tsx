"use client";

import { formatRupiah, formatDate } from "@/lib/utils";
import {
  STORE_NAME,
  STORE_ADDRESS,
  STORE_PHONE,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants";
import { Printer, X, CheckCircle } from "lucide-react";

interface ReceiptData {
  orderNumber: string;
  createdAt: string;
  cashierName: string;
  customerName?: string;
  paymentMethod: string;
  items: {
    name: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  subtotal: number;
  discountValue: number;
  discountType: string;
  taxAmount: number;
  total: number;
  cashReceived?: number;
  changeAmount?: number;
}

interface ReceiptPrintProps {
  receipt: ReceiptData | null;
  onClose: () => void;
}

export default function ReceiptPrint({ receipt, onClose }: ReceiptPrintProps) {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const discountAmount =
    receipt.discountType === "PERCENT"
      ? Math.round((receipt.subtotal * receipt.discountValue) / 100)
      : receipt.discountValue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-xl animate-scale-in">
        {/* Success Header (hidden in print) */}
        <div className="bg-emerald-400 text-white p-6 text-center print:hidden">
          <CheckCircle className="w-12 h-12 mx-auto mb-2" />
          <h2 className="text-xl font-bold">Pembayaran Berhasil!</h2>
          <p className="text-sm opacity-90 mt-1">
            {receipt.orderNumber}
          </p>
        </div>

        {/* Receipt Content */}
        <div className="receipt-print p-6 font-mono text-xs leading-relaxed">
          {/* Store Header */}
          <div className="text-center mb-4">
            <h3 className="font-bold text-base">{STORE_NAME}</h3>
            <p className="text-muted">{STORE_ADDRESS}</p>
            <p className="text-muted">{STORE_PHONE}</p>
          </div>

          <div className="border-t border-dashed border-border my-2" />

          {/* Order Info */}
          <div className="space-y-1 mb-3">
            <div className="flex justify-between">
              <span>No. Faktur</span>
              <span>{receipt.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal</span>
              <span>{formatDate(receipt.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir</span>
              <span>{receipt.cashierName}</span>
            </div>
            {receipt.customerName && (
              <div className="flex justify-between">
                <span>Pelanggan</span>
                <span>{receipt.customerName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Bayar</span>
              <span>
                {PAYMENT_METHOD_LABELS[receipt.paymentMethod] ||
                  receipt.paymentMethod}
              </span>
            </div>
          </div>

          <div className="border-t border-dashed border-border my-2" />

          {/* Items */}
          <div className="space-y-2 mb-3">
            {receipt.items.map((item, idx) => (
              <div key={idx}>
                <p className="font-medium">
                  {item.name}
                </p>
                <p className="text-muted">
                  {item.color} / {item.size}
                </p>
                <div className="flex justify-between">
                  <span>
                    {item.quantity} x {formatRupiah(item.unitPrice)}
                  </span>
                  <span>{formatRupiah(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-border my-2" />

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatRupiah(receipt.subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span>
                  Diskon{" "}
                  {receipt.discountType === "PERCENT"
                    ? `${receipt.discountValue}%`
                    : ""}
                </span>
                <span>-{formatRupiah(discountAmount)}</span>
              </div>
            )}
            {receipt.taxAmount > 0 && (
              <div className="flex justify-between">
                <span>PPN 11%</span>
                <span>{formatRupiah(receipt.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-dashed border-border">
              <span>TOTAL</span>
              <span>{formatRupiah(receipt.total)}</span>
            </div>
            {receipt.cashReceived && (
              <>
                <div className="flex justify-between">
                  <span>Tunai</span>
                  <span>{formatRupiah(receipt.cashReceived)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kembalian</span>
                  <span>{formatRupiah(receipt.changeAmount || 0)}</span>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-dashed border-border my-3" />

          <div className="text-center text-muted">
            <p>Terima kasih telah berbelanja!</p>
            <p>Semoga anda suka dengan pelayanan kami</p>
          </div>
        </div>

        {/* Actions (hidden in print) */}
        <div className="flex gap-3 p-4 border-t border-border print:hidden">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-border text-foreground font-medium hover:bg-background transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 h-11 rounded-xl bg-navy-600 hover:bg-navy-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
}
