"use client";

import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface ProductGridFilterProps {
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  categories: Category[];
}

export default function ProductGridFilter({
  selectedCategory,
  onCategoryChange,
  categories,
}: ProductGridFilterProps) {
  const allCategories = [{ id: "", name: "Semua" }, ...categories];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {allCategories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
            selectedCategory === cat.id
              ? "bg-navy-600 text-white shadow-sm"
              : "bg-white text-muted border border-border hover:border-navy-300 hover:text-foreground"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
