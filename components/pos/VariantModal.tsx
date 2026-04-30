"use client";

import { useState, useMemo } from "react";
import { X, Minus, Plus, ShoppingCart } from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import { SIZE_ORDER } from "@/lib/constants";
import { useCartStore } from "@/lib/store";
import type { ProductWithVariants } from "./ProductCard";

interface VariantModalProps {
  product: ProductWithVariants | null;
  onClose: () => void;
}

export default function VariantModal({ product, onClose }: VariantModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);


  // Unique colors
  const uniqueColors = useMemo(() => {
    if (!product) return [];
    const map = new Map<string, { color: string; colorHex: string | null }>();
    product.variants.forEach((v) => {
      if (!map.has(v.color)) {
        map.set(v.color, { color: v.color, colorHex: v.colorHex });
      }
    });
    return Array.from(map.values());
  }, [product?.variants]);

  // Unique sizes sorted
  const sortedSizes = useMemo(() => {
    if (!product) return [];
    const sizes = [...new Set(product.variants.map((v) => v.size))];
    return sizes.sort(
      (a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b)
    );
  }, [product?.variants]);

  // Auto-select first available color
  if (product && !selectedColor && uniqueColors.length > 0) {
    const firstWithStock = uniqueColors.find((c) =>
      product.variants.some((v) => v.color === c.color && v.stock > 0)
    );
    if (firstWithStock) {
      setSelectedColor(firstWithStock.color);
    }
  }

  // Get stock for a size+color combo
  const getStock = (size: string, color: string) => {
    if (!product) return 0;
    const variant = product.variants.find(
      (v) => v.size === size && v.color === color
    );
    return variant?.stock ?? 0;
  };

  // Selected variant
  const selectedVariant =
    product && selectedSize && selectedColor
      ? product.variants.find(
          (v) => v.size === selectedSize && v.color === selectedColor
        )
      : null;

  const currentStock = selectedVariant?.stock ?? 0;
  const currentPrice =
    selectedVariant?.price ?? product?.basePrice ?? 0;

  const handleAddToCart = () => {
    if (!product || !selectedVariant || quantity < 1) return;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      size: selectedSize!,
      color: selectedColor!,
      colorHex:
        uniqueColors.find((c) => c.color === selectedColor)?.colorHex ??
        undefined,
      imageUrl: product.imageUrl ?? undefined,
      unitPrice: currentPrice,
      maxStock: selectedVariant.stock,
    });

    onClose();
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up md:animate-scale-in shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 flex items-center justify-between p-4 border-b border-border">
          <div>
            {product.brand && (
              <p className="text-[10px] font-medium text-muted uppercase tracking-wider">
                {product.brand}
              </p>
            )}
            <h2 className="text-lg font-bold text-foreground">
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-background flex items-center justify-center hover:bg-navy-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Price */}
          <div className="text-2xl font-mono font-bold text-emerald-400">
            {formatRupiah(currentPrice)}
          </div>

          {/* Color Selection */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Warna:{" "}
              <span className="font-normal text-muted">
                {selectedColor || "Pilih warna"}
              </span>
            </label>
            <div className="flex flex-wrap gap-3">
              {uniqueColors.map((c) => {
                const hasStock = product.variants.some(
                  (v) => v.color === c.color && v.stock > 0
                );
                return (
                  <button
                    key={c.color}
                    onClick={() => {
                      setSelectedColor(c.color);
                      setSelectedSize(null);
                      setQuantity(1);
                    }}
                    disabled={!hasStock}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                      selectedColor === c.color
                        ? "border-navy-600 bg-navy-50"
                        : "border-border hover:border-navy-300",
                      !hasStock && "opacity-40 cursor-not-allowed"
                    )}
                    title={c.color}
                  >
                    <div
                      className="color-swatch-lg"
                      style={{
                        backgroundColor: c.colorHex || "#ccc",
                        borderColor:
                          selectedColor === c.color
                            ? "#1A365D"
                            : c.colorHex?.toLowerCase() === "#ffffff"
                            ? "#E2E8F0"
                            : "transparent",
                      }}
                    />
                    <span className="text-sm font-medium">{c.color}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Ukuran:{" "}
              <span className="font-normal text-muted">
                {selectedSize || "Pilih ukuran"}
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {sortedSizes.map((size) => {
                const stock = selectedColor
                  ? getStock(size, selectedColor)
                  : 0;
                return (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setQuantity(1);
                    }}
                    disabled={stock === 0}
                    className={cn(
                      "size-btn",
                      selectedSize === size && "selected"
                    )}
                  >
                    {size}
                    {stock > 0 && selectedColor && (
                      <span className="text-[10px] text-muted ml-1 font-mono">
                        ({stock})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock Info */}
          {selectedVariant && (
            <div className="bg-background rounded-lg p-3 text-sm animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-muted">Stok tersedia:</span>
                <span
                  className={cn(
                    "font-mono font-semibold",
                    currentStock < 5 ? "text-warning" : "text-emerald-500"
                  )}
                >
                  {currentStock} pcs
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-muted">SKU:</span>
                <span className="font-mono text-xs text-muted">
                  {selectedVariant.sku}
                </span>
              </div>
            </div>
          )}

          {/* Quantity */}
          {selectedVariant && (
            <div className="animate-fade-in">
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Jumlah
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-navy-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.min(Math.max(1, val), currentStock));
                  }}
                  min={1}
                  max={currentStock}
                  className="w-20 h-10 text-center font-mono font-bold text-lg rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-navy-400/40"
                />
                <button
                  onClick={() =>
                    setQuantity(Math.min(currentStock, quantity + 1))
                  }
                  className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-navy-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border p-4">
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || quantity < 1}
            className={cn(
              "w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all",
              selectedVariant && quantity > 0
                ? "bg-emerald-400 hover:bg-emerald-500 shadow-lg shadow-emerald-400/25 active:scale-[0.98]"
                : "bg-border text-muted cursor-not-allowed"
            )}
          >
            <ShoppingCart className="w-5 h-5" />
            {selectedVariant
              ? `Tambah ke Keranjang — ${formatRupiah(currentPrice * quantity)}`
              : "Pilih Ukuran & Warna"}
          </button>
        </div>
      </div>
    </div>
  );
}
