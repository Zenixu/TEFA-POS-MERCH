"use client";

import { QrCode, CheckCircle } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface PaymentQRISProps {
  total: number;
  onConfirm: () => void;
}

export default function PaymentQRIS({ total, onConfirm }: PaymentQRISProps) {
  return (
    <div className="space-y-4 text-center animate-fade-in">
      {/* QR Placeholder */}
      <div className="mx-auto w-56 h-56 bg-white border-2 border-border rounded-2xl flex flex-col items-center justify-center shadow-inner">
        <QrCode className="w-24 h-24 text-navy-300 mb-2" />
        <p className="text-sm text-muted font-medium">QR Code QRIS</p>
        <p className="text-xs text-muted mt-1">Scan untuk membayar</p>
      </div>

      {/* Total */}
      <div className="bg-navy-50 rounded-xl p-4">
        <p className="text-sm text-muted mb-1">Total Pembayaran</p>
        <p className="text-2xl font-mono font-bold text-navy-600">
          {formatRupiah(total)}
        </p>
      </div>

      <p className="text-xs text-muted">
        Scan QR code di atas menggunakan aplikasi e-wallet atau mobile banking.
        <br />
        Klik &quot;Konfirmasi&quot; setelah pembayaran berhasil.
      </p>

      {/* Confirm */}
      <button
        onClick={onConfirm}
        className="w-full h-12 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-400/25 active:scale-[0.98] transition-all"
      >
        <CheckCircle className="w-5 h-5" />
        Konfirmasi Pembayaran QRIS
      </button>
    </div>
  );
}
