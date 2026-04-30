"use client";

import { Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  title?: string;
  className?: string;
}

export default function Header({
  searchValue,
  onSearchChange,
  title,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border h-20 flex items-center px-4 md:px-8 gap-6 shadow-sm",
        className
      )}
    >
      {/* Title (optional) */}
      {title && (
        <h1 className="text-lg font-bold text-foreground hidden md:block mr-4 whitespace-nowrap">
          {title}
        </h1>
      )}

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari produk, SKU, atau scan barcode..."
          autoComplete="off"
          className="w-full h-12 pl-12 pr-4 rounded-xl bg-background border border-border text-base placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-navy-400/40 focus:border-navy-400 transition-all shadow-inner"
        />
      </div>

      {/* Profile */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center">
          <User className="w-4 h-4 text-navy-600" />
        </div>
      </div>
    </header>
  );
}
