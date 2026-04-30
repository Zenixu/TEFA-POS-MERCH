"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import BottomBar from "@/components/layout/BottomBar";
import { formatRupiah, formatDate, cn } from "@/lib/utils";
import {
  PAYMENT_METHOD_LABELS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from "@/lib/constants";
import {
  Search,
  Calendar,
  Filter,
  Eye,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
} from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  snapshot: {
    name?: string;
    size?: string;
    color?: string;
  };
  product: { name: string };
  variant: { size: string; color: string } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  subtotal: number;
  discountValue: number;
  discountType: string | null;
  taxAmount: number;
  total: number;
  cashReceived: number | null;
  changeAmount: number | null;
  cashierName: string | null;
  note: string | null;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string | null;
  } | null;
  items: OrderItem[];
}

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (dateFrom) params.set("from", dateFrom);
        if (dateTo) params.set("to", dateTo);
        if (methodFilter) params.set("method", methodFilter);
        const res = await fetch(`/api/orders?${params}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("API Error:", data);
          setOrders([]);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [dateFrom, dateTo, methodFilter]);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

  const handleExportCSV = () => {
    const header = "No,Order Number,Tanggal,Metode,Total,Kasir\n";
    const rows = orders
      .map(
        (o, i) =>
          `${i + 1},${o.orderNumber},${new Date(o.createdAt).toLocaleDateString("id-ID")},${o.paymentMethod},${o.total},${o.cashierName || "-"}`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `riwayat-transaksi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      if (methodFilter) params.set("method", methodFilter);
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Yakin hapus transaksi ini?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        if (selectedOrder?.id === id) setSelectedOrder(null);
      } else {
        alert("Gagal menghapus transaksi");
      }
    } catch {
      alert("Gagal menghubungi server");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] xl:pl-[240px]">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-4 md:px-6 gap-4">
          <h1 className="text-lg font-bold text-foreground whitespace-nowrap">
            📋 Riwayat Transaksi
          </h1>
          <button
            onClick={handleExportCSV}
            disabled={orders.length === 0}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-navy-50 text-navy-600 text-sm font-medium hover:bg-navy-100 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </header>

        <main className="p-4 md:p-6 bottom-bar-space">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-navy-400/40"
              />
              <span className="text-muted text-sm">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-navy-400/40"
              />
            </div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-navy-400/40"
            >
              <option value="">Semua Metode</option>
              <option value="CASH">Tunai</option>
              <option value="CARD">Kartu</option>
              <option value="QRIS">QRIS</option>
            </select>
            <div className="bg-white rounded-lg border border-border px-3 h-9 flex items-center text-sm">
              <span className="text-muted mr-2">Total:</span>
              <span className="font-bold font-mono text-emerald-500">
                {formatRupiah(totalRevenue)}
              </span>
              <span className="text-muted ml-2">
                ({orders.length} transaksi)
              </span>
            </div>
          </div>

          {/* Orders Table */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-border p-4 animate-pulse"
                >
                  <div className="h-4 bg-navy-50 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-navy-50 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted text-sm">
                Belum ada transaksi
                {dateFrom || dateTo ? " pada rentang tanggal ini" : ""}.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted uppercase border-b border-border bg-background/50">
                      <th className="text-left py-3 px-4">No. Faktur</th>
                      <th className="text-left py-3 px-4">Tanggal</th>
                      <th className="text-left py-3 px-4">Pelanggan</th>
                      <th className="text-left py-3 px-4">Metode</th>
                      <th className="text-left py-3 px-4">Items</th>
                      <th className="text-right py-3 px-4">Total</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-center py-3 px-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-border/60 hover:bg-background/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="py-3 px-4 font-mono text-xs font-medium">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-4 text-muted">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {order.customer ? (
                             <span className="font-semibold text-navy-600">{order.customer.firstName} {order.customer.lastName || ''}</span>
                          ) : (
                             <span className="text-muted italic">Tamu</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {PAYMENT_METHOD_LABELS[order.paymentMethod] ||
                            order.paymentMethod}
                        </td>
                        <td className="py-3 px-4 text-muted">
                          {order.items.length} item
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          {formatRupiah(order.total)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full",
                              ORDER_STATUS_COLORS[order.status] ||
                                "bg-gray-100 text-gray-600"
                            )}
                          >
                            {ORDER_STATUS_LABELS[order.status] || order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                              }}
                              className="text-muted hover:text-navy-600 transition-colors p-1"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOrder(order.id);
                              }}
                              disabled={deletingId === order.id}
                              className="text-muted hover:text-red-500 transition-colors p-1 disabled:opacity-50"
                            >
                              {deletingId === order.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-white w-full max-w-lg mx-4 rounded-2xl max-h-[85vh] overflow-y-auto shadow-xl animate-scale-in">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-bold text-foreground">
                Detail Transaksi
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-background flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Order Info */}
              <div className="bg-background rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">No. Faktur</span>
                  <span className="font-mono font-medium">
                    {selectedOrder.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Tanggal</span>
                  <span>{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Kasir</span>
                  <span>{selectedOrder.cashierName || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Pelanggan</span>
                  <span>{selectedOrder.customer ? <span className="font-semibold text-navy-600">{selectedOrder.customer.firstName} {selectedOrder.customer.lastName || ''}</span> : "Tamu"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Metode Bayar</span>
                  <span>
                    {PAYMENT_METHOD_LABELS[selectedOrder.paymentMethod]}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Item Pesanan
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => {
                    const snapshot = item.snapshot as {
                      name?: string;
                      size?: string;
                      color?: string;
                    };
                    return (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <div>
                          <p className="font-medium">
                            {snapshot?.name || item.product.name}
                          </p>
                          <p className="text-xs text-muted">
                            {snapshot?.color || item.variant?.color} ·{" "}
                            {snapshot?.size || item.variant?.size} ·{" "}
                            {item.quantity}x
                          </p>
                        </div>
                        <span className="font-mono">
                          {formatRupiah(item.subtotal)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-mono">
                    {formatRupiah(selectedOrder.subtotal)}
                  </span>
                </div>
                {selectedOrder.discountValue > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted">Diskon</span>
                    <span className="font-mono text-danger">
                      -{formatRupiah(selectedOrder.discountValue)}
                    </span>
                  </div>
                )}
                {selectedOrder.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted">PPN</span>
                    <span className="font-mono">
                      {formatRupiah(selectedOrder.taxAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                  <span>TOTAL</span>
                  <span className="font-mono text-emerald-500">
                    {formatRupiah(selectedOrder.total)}
                  </span>
                </div>
                {selectedOrder.cashReceived && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Tunai</span>
                      <span className="font-mono">
                        {formatRupiah(selectedOrder.cashReceived)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Kembalian</span>
                      <span className="font-mono">
                        {formatRupiah(selectedOrder.changeAmount || 0)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {selectedOrder.note && (
                <div className="bg-background rounded-lg p-3 text-sm">
                  <span className="text-muted">Catatan:</span>{" "}
                  {selectedOrder.note}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomBar />
    </div>
  );
}
