"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  ClipboardList,
  Tags,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

const allNavItems = [
  { href: "/", label: "Kasir", icon: ShoppingCart, roles: ["CASHIER", "MANAGER", "SUPERADMIN"] },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["MANAGER", "SUPERADMIN"] },
  { href: "/products", label: "Produk", icon: Package, roles: ["MANAGER", "SUPERADMIN"] },
  { href: "/categories", label: "Kategori", icon: Tags, roles: ["MANAGER", "SUPERADMIN"] },
  { href: "/history", label: "Riwayat", icon: ClipboardList, roles: ["CASHIER", "MANAGER", "SUPERADMIN"] },
];

export default function BottomBar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setRole(d.user.role); })
      .catch(() => {});
  }, []);

  const navItems = useMemo(() => {
    if (!role) return allNavItems;
    return allNavItems.filter((item) => item.roles.includes(role));
  }, [role]);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-20 px-4 pb-2">
        {navItems.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-3 transition-colors",
                isActive
                  ? "text-navy-600"
                  : "text-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-6 h-6 mb-1",
                  isActive ? "text-emerald-400 drop-shadow-sm" : ""
                )}
              />
              <span className="text-xs font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
