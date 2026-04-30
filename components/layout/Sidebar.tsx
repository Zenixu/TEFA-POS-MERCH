"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  ClipboardList,
  Store,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Users,
  Truck,
  Tags,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

const allNavItems = [
  { href: "/", label: "Kasir POS", icon: ShoppingCart, roles: ["CASHIER", "MANAGER", "SUPERADMIN"] },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["MANAGER", "SUPERADMIN"] },
  { href: "/products", label: "Produk", icon: Package, roles: ["MANAGER", "SUPERADMIN"] },
  { href: "/categories", label: "Kategori", icon: Tags, roles: ["MANAGER", "SUPERADMIN"] },
  { href: "/customers", label: "Pelanggan", icon: Users, roles: ["CASHIER", "MANAGER", "SUPERADMIN"] },
  { href: "/suppliers", label: "Supplier", icon: Truck, roles: ["MANAGER", "SUPERADMIN"] },
  { href: "/history", label: "Riwayat", icon: ClipboardList, roles: ["CASHIER", "MANAGER", "SUPERADMIN"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<{ firstName: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const navItems = useMemo(() => {
    if (!user) return allNavItems; // Show all while loading
    return allNavItems.filter((item) => item.roles.includes(user.role));
  }, [user]);

  return (
    <>
      {/* Desktop Sidebar — hidden below xl */}
      <aside
        className={cn(
          "hidden xl:flex fixed left-0 top-0 h-full flex-col z-40 bg-navy-600 text-white transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-20 border-b border-navy-500/30">
          <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center flex-shrink-0">
            <img src="/logo_zielabs_kotak.png" alt="Logo" className="w-full h-full object-contain rounded-md" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-sm tracking-wide">TEFA MERCH</h1>
              <p className="text-[10px] text-navy-200 tracking-wider">
                POINT OF SALE
              </p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-navy-200 hover:bg-white/8 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "text-emerald-400" : ""
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-navy-500/30">
          {user && !collapsed && (
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-white truncate">{user.firstName}</p>
              <p className="text-[10px] text-navy-300 uppercase tracking-wider">{user.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-5 py-3 text-sm text-navy-200 hover:bg-red-500/15 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-12 border-t border-navy-500/30 hover:bg-white/8 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* Tablet Sidebar — hidden below md, hidden at xl+ */}
      <aside className="hidden md:flex xl:hidden fixed left-0 top-0 h-full w-[80px] flex-col z-40 bg-navy-600 text-white">
        <div className="flex items-center justify-center h-20 border-b border-navy-500/30">
          <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center">
            <img src="/logo_zielabs_kotak.png" alt="Logo" className="w-full h-full object-contain rounded-md" />
          </div>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg text-[10px] font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-navy-200 hover:bg-white/8 hover:text-white"
                )}
                title={item.label}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? "text-emerald-400" : ""
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-2 py-3 text-[10px] font-medium text-navy-200 hover:bg-red-500/15 hover:text-red-400 transition-all border-t border-navy-500/30"
        >
          <LogOut className="w-5 h-5" />
          <span>Keluar</span>
        </button>
      </aside>
    </>
  );
}
