"use client";

import { formatRupiah, cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/constants";
import { Package } from "lucide-react";

export interface ProductWithVariants {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  category: { id: string; name: string };
  brand: string | null;
  imageUrl: string | null;
  categoryId: string;
  isActive: boolean;
  variants: {
    id: string;
    size: string;
    color: string;
    colorHex: string | null;
    stock: number;
    price: number | null;
    sku: string;
  }[];
}

interface ProductCardProps {
  product: ProductWithVariants;
  onClick: (product: ProductWithVariants) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const isOutOfStock = totalStock === 0;
  const isLowStock = totalStock > 0 && totalStock < 5;

  // Get unique colors for swatches
  const uniqueColors = product.variants.reduce(
    (acc, v) => {
      if (!acc.find((c) => c.color === v.color)) {
        acc.push({ color: v.color, colorHex: v.colorHex });
      }
      return acc;
    },
    [] as { color: string; colorHex: string | null }[]
  );

  // Min price (could be variant override or base)
  const prices = product.variants
    .filter((v) => v.stock > 0)
    .map((v) => v.price ?? product.basePrice);
  const minPrice = prices.length > 0 ? Math.min(...prices) : product.basePrice;

  return (
    <button
      onClick={() => !isOutOfStock && onClick(product)}
      disabled={isOutOfStock}
      className={cn(
        "product-card w-full bg-white rounded-xl border border-border overflow-hidden text-left group",
        isOutOfStock ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      )}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-navy-50 to-navy-100/50 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Package className="w-12 h-12 text-navy-200" />
        )}

        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {isOutOfStock && <span className="badge-out-of-stock">Habis</span>}
          {isLowStock && <span className="badge-low-stock">Stok Tipis</span>}
        </div>

        {/* Category badge */}
        <span className="absolute top-2 left-2 bg-navy-600/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
          {product.category?.name || "Uncategorized"}
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Brand */}
        {product.brand && (
          <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-0.5">
            {product.brand}
          </p>
        )}

        {/* Name */}
        <h3 className="text-sm font-semibold text-foreground truncate">
          {product.name}
        </h3>

        {/* Price */}
        <p className="font-mono text-base font-bold text-emerald-400 mt-1">
          {formatRupiah(minPrice)}
        </p>

        {/* Color swatches + stock */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-1">
            {uniqueColors.slice(0, 5).map((c) => (
              <div
                key={c.color}
                className="color-swatch"
                style={{
                  backgroundColor: c.colorHex || "#ccc",
                  borderColor:
                    c.colorHex?.toLowerCase() === "#ffffff"
                      ? "#E2E8F0"
                      : "transparent",
                }}
                title={c.color}
              />
            ))}
            {uniqueColors.length > 5 && (
              <span className="text-[10px] text-muted self-center ml-1">
                +{uniqueColors.length - 5}
              </span>
            )}
          </div>

          <span
            className={cn(
              "text-[11px] font-medium font-mono",
              isLowStock
                ? "text-warning"
                : isOutOfStock
                ? "text-danger"
                : "text-muted"
            )}
          >
            {totalStock} pcs
          </span>
        </div>
      </div>
    </button>
  );
}
