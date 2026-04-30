"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import BottomBar from "@/components/layout/BottomBar";
import StatsCard from "@/components/dashboard/StatsCard";
import SalesChart from "@/components/dashboard/SalesChart";
import TopProducts from "@/components/dashboard/TopProducts";
import LowStockAlert from "@/components/dashboard/LowStockAlert";
import { formatRupiah } from "@/lib/utils";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Banknote,
  CreditCard,
  QrCode,
  RefreshCw,
  Users,
  Truck,
} from "lucide-react";

interface DashboardData {
  totalRevenue: number;
  totalTransactions: number;
  averageTransaction: number;
  paymentBreakdown: { CASH: number; CARD: number; QRIS: number };
  revenueByMethod: { CASH: number; CARD: number; QRIS: number };
  topProducts: { name: string; quantity: number; revenue: number }[];
  hourlySales: { hour: string; sales: number; revenue: number }[];
  lowStockVariants: {
    id: string;
    size: string;
    color: string;
    stock: number;
    product: { name: string };
  }[];
  totalCustomers: number;
  totalSuppliers: number;
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (!json.error && json.paymentBreakdown) {
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    
    // Auto refresh data every 10 seconds for real-time updates
    const intervalId = setInterval(() => {
      fetchDashboard(true);
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] xl:pl-[240px]">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-4 md:px-6">
          <h1 className="text-lg font-bold text-foreground">
            📊 Dashboard Penjualan
          </h1>
          <button
            onClick={() => fetchDashboard()}
            disabled={loading}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-navy-50 text-navy-600 text-sm font-medium hover:bg-navy-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        <main className="p-4 md:p-6 bottom-bar-space space-y-6">
          {loading && !data ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse">
                  <div className="h-3 bg-navy-50 rounded w-1/2 mb-2" />
                  <div className="h-8 bg-navy-50 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : data ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatsCard title="Pendapatan Hari Ini" value={formatRupiah(data.totalRevenue)} icon={DollarSign} color="emerald" />
                <StatsCard title="Total Transaksi" value={data.totalTransactions.toString()} subtitle="transaksi hari ini" icon={ShoppingBag} color="navy" />
                <StatsCard title="Rata-rata Transaksi" value={formatRupiah(data.averageTransaction)} icon={TrendingUp} color="navy" />
                <StatsCard title="Stok Kritis" value={data.lowStockVariants.length.toString()} subtitle="variant perlu restock" icon={TrendingUp} color={data.lowStockVariants.length > 0 ? "warning" : "emerald"} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <StatsCard title="Tunai" value={formatRupiah(data.revenueByMethod.CASH)} subtitle={`${data.paymentBreakdown.CASH} transaksi`} icon={Banknote} color="emerald" />
                <StatsCard title="Kartu" value={formatRupiah(data.revenueByMethod.CARD)} subtitle={`${data.paymentBreakdown.CARD} transaksi`} icon={CreditCard} color="navy" />
                <StatsCard title="QRIS" value={formatRupiah(data.revenueByMethod.QRIS)} subtitle={`${data.paymentBreakdown.QRIS} transaksi`} icon={QrCode} color="navy" />
                <StatsCard title="Pelanggan" value={data.totalCustomers.toString()} subtitle="terdaftar" icon={Users} color="navy" />
                <StatsCard title="Supplier" value={data.totalSuppliers.toString()} subtitle="mitra vendor" icon={Truck} color="navy" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SalesChart data={data.hourlySales} />
                <TopProducts data={data.topProducts} />
              </div>

              <LowStockAlert data={data.lowStockVariants} />
            </>
          ) : null}
        </main>
      </div>
      <BottomBar />
    </div>
  );
}
