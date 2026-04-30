"use client";

import { X, ShoppingCart, CreditCard, Trash2, Users } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatRupiah } from "@/lib/utils";
import { useState, useEffect } from "react";
import CartItem from "./CartItem";
import DiscountInput from "./DiscountInput";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  open,
  onClose,
  onCheckout,
}: CartDrawerProps) {
  const {
    items,
    clearCart,
    getSubtotal,
    getDiscountAmount,
    getTaxAmount,
    getTotal,
    getItemCount,
    taxEnabled,
    customerId,
    setCustomerId
  } = useCartStore();

  const [customers, setCustomers] = useState<{id: string, name: string}[]>([{id: "", name: "Tamu (Umum)"}]);

  useEffect(() => {
    fetch("/api/customers")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomers([
            {id: "", name: "Tamu (Umum)"}, 
            ...data.map(c => ({id: c.id, name: `${c.firstName} ${c.lastName || ''}`.trim()}))
          ]);
        }
      })
      .catch(console.error);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] flex flex-col animate-slide-up shadow-xl">
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-navy-600" />
            <h2 className="font-bold text-foreground">Keranjang</h2>
            <span className="bg-navy-600 text-white text-xs font-mono px-2 py-0.5 rounded-full">
              {getItemCount()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-muted hover:text-danger transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-background flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <ShoppingCart className="w-12 h-12 text-navy-200 mb-3" />
            <p className="text-sm text-muted">Keranjang kosong</p>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-2 max-h-[35vh]">
              {items.map((item) => (
                <CartItem key={item.variantId} item={item} />
              ))}
            </div>

            {/* Discount & Options */}
            <div className="px-5 py-3 border-t border-border flex flex-col gap-3">
              <div>
                 <label className="text-xs text-muted block mb-1 font-medium flex items-center gap-1">
                   <Users className="w-3 h-3" /> Rekam Pelanggan
                 </label>
                 <select 
                   value={customerId || ""} 
                   onChange={(e) => setCustomerId(e.target.value || null)}
                   className="w-full text-sm bg-background border border-border rounded-lg h-9 px-2 focus:outline-none focus:border-navy-400"
                 >
                   {customers.map(c => (
                     <option key={c.id || 'none'} value={c.id}>{c.name}</option>
                   ))}
                 </select>
              </div>
              <DiscountInput />
            </div>

            {/* Summary */}
            <div className="px-5 py-3 border-t border-border bg-background/50 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-mono font-medium">
                  {formatRupiah(getSubtotal())}
                </span>
              </div>
              {getDiscountAmount() > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Diskon</span>
                  <span className="font-mono font-medium text-danger">
                    -{formatRupiah(getDiscountAmount())}
                  </span>
                </div>
              )}
              {taxEnabled && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">PPN 11%</span>
                  <span className="font-mono font-medium">
                    {formatRupiah(getTaxAmount())}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                <span>TOTAL</span>
                <span className="font-mono text-emerald-500">
                  {formatRupiah(getTotal())}
                </span>
              </div>
            </div>

            {/* Pay */}
            <div className="p-4 border-t border-border safe-bottom">
              <button
                onClick={onCheckout}
                className="w-full h-12 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-400/25 active:scale-[0.98] transition-all"
              >
                <CreditCard className="w-5 h-5" />
                Bayar {formatRupiah(getTotal())}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
