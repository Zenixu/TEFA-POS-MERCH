"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import BottomBar from "@/components/layout/BottomBar";
import Header from "@/components/layout/Header";
import ProductCard, { type ProductWithVariants } from "@/components/pos/ProductCard";
import ProductGridFilter from "@/components/pos/ProductGridFilter";
import VariantModal from "@/components/pos/VariantModal";
import CartPanel from "@/components/pos/CartPanel";
import CartDrawer from "@/components/pos/CartDrawer";
import CheckoutModal, { type OrderPayload } from "@/components/pos/CheckoutModal";
import ReceiptPrint from "@/components/pos/ReceiptPrint";
import { useCartStore } from "@/lib/store";
import { ShoppingCart } from "lucide-react";
import { db } from "@/lib/db";

export default function POSPage() {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductWithVariants | null>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  const { items, getItemCount, getTotal, clearCart } = useCartStore();

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      
      if (navigator.onLine) {
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
          // Only overwrite local cache if no filters applied
          if (!search && !category) {
            await db.products.clear();
            await db.products.bulkPut(data);
          }
        } else {
          console.error(`API Error [HTTP ${res.status}]:`, data);
          // Fallback to offline cache if available
          const cached = await db.products.toArray();
          setProducts(cached);
        }
      } else {
        // Offline: Read from Dexie
        let offlineProducts = await db.products.toArray();
        if (category) {
          offlineProducts = offlineProducts.filter(p => p.categoryId === category);
        }
        if (search) {
          const s = search.toLowerCase();
          offlineProducts = offlineProducts.filter(p => p.name.toLowerCase().includes(s));
        }
        setProducts(offlineProducts);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      const offlineProducts = await db.products.toArray();
      setProducts(offlineProducts);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  const fetchCategories = useCallback(async () => {
    try {
      if (navigator.onLine) {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
          await db.categories.clear();
          await db.categories.bulkPut(data);
        }
      } else {
        const offlineCats = await db.categories.toArray();
        setCategories(offlineCats);
      }
    } catch (e) {
      console.error("Failed to fetch categories:", e);
      const offlineCats = await db.categories.toArray();
      setCategories(offlineCats);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Sync offline orders when back online
  useEffect(() => {
    const syncOrders = async () => {
      const pendingList = await db.pendingOrders.where("syncStatus").equals("PENDING").toArray();
      if (pendingList.length === 0) return;

      for (const order of pendingList) {
        try {
          const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order.payload),
          });
          if (res.ok) {
            await db.pendingOrders.delete(order.id);
          } else {
             await db.pendingOrders.update(order.id, { syncStatus: "FAILED" });
          }
        } catch (e) {
          // still offline or failed, do nothing, stays PENDING
        }
      }
    };

    const handleOnline = () => {
      syncOrders();
      fetchProducts(); // Refresh stock after syncing
    };

    window.addEventListener("online", handleOnline);
    if (navigator.onLine) {
      syncOrders();
    }

    return () => window.removeEventListener("online", handleOnline);
  }, [fetchProducts]);

  // Debounced search
  const [searchDebounce, setSearchDebounce] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchDebounce), 300);
    return () => clearTimeout(timer);
  }, [searchDebounce]);

  const buildReceipt = (payload: OrderPayload, orderNumber: string, customerName?: string) => {
    const receiptData = {
      orderNumber,
      createdAt: new Date().toISOString(),
      cashierName: payload.cashierName,
      customerName: customerName || undefined,
      paymentMethod: payload.paymentMethod,
      items: payload.items.map((item) => ({
        name: item.snapshot.name,
        size: item.snapshot.size,
        color: item.snapshot.color,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
      subtotal: payload.subtotal,
      discountValue: payload.discountValue,
      discountType: payload.discountType,
      taxAmount: payload.taxAmount,
      total: payload.total,
      cashReceived: payload.cashReceived,
      changeAmount:
        payload.paymentMethod === "CASH" && payload.cashReceived
          ? payload.cashReceived - payload.total
          : undefined,
    };

    setReceipt(receiptData);
    setCheckoutOpen(false);
    clearCart();
    fetchProducts(); // Refresh stock
  };

  const handleCheckout = async (payload: OrderPayload) => {
    setIsProcessing(true);
    try {
      if (!navigator.onLine) {
        // Offline Checkout
        const offlineOrder = {
          id: crypto.randomUUID(),
          syncStatus: "PENDING" as const,
          createdAt: new Date(),
          payload
        };
        await db.pendingOrders.put(offlineOrder);
        
        buildReceipt(payload, `OFFLINE-${offlineOrder.id.slice(0, 8).toUpperCase()}`);
        alert("Anda sedang offline. Pesanan disimpan secara lokal dan akan disinkronisasi ketika koneksi pulih.");
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Gagal membuat pesanan");
        return;
      }

      const order = await res.json();
      const customerName = order.customer ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim() : undefined;
      buildReceipt(payload, order.orderNumber, customerName);
      
    } catch (error) {
      console.error("Checkout error:", error);
      // Fallback to offline
      const offlineOrder = {
        id: crypto.randomUUID(),
        syncStatus: "PENDING" as const,
        createdAt: new Date(),
        payload
      };
      await db.pendingOrders.put(offlineOrder);
      buildReceipt(payload, `OFFLINE-${offlineOrder.id.slice(0, 8).toUpperCase()}`);
      alert("Gagal menghubungi server. Pesanan disimpan secara lokal.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="md:pl-[72px] xl:pl-[240px] flex">
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Header
            searchValue={searchDebounce}
            onSearchChange={setSearchDebounce}
            title="Kasir POS"
          />

          <main className="flex-1 p-4 md:p-6 bottom-bar-space">
            {/* Category Filter */}
            <div className="mb-4">
              <ProductGridFilter
                selectedCategory={category}
                onCategoryChange={setCategory}
                categories={categories}
              />
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-border overflow-hidden animate-pulse"
                  >
                    <div className="aspect-square bg-navy-50" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-navy-50 rounded w-2/3" />
                      <div className="h-4 bg-navy-50 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted text-sm">
                  {search
                    ? `Tidak ada produk untuk "${search}"`
                    : "Belum ada produk."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Cart Panel (Desktop) */}
        <CartPanel
          onCheckout={() => setCheckoutOpen(true)}
        />
      </div>

      {/* Mobile FAB */}
      {items.length > 0 && (
        <button
          onClick={() => setCartDrawerOpen(true)}
          className="xl:hidden fixed bottom-20 md:bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-emerald-400 text-white shadow-lg shadow-emerald-400/30 flex items-center justify-center active:scale-95 transition-transform animate-bounce-in"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-navy-600 text-white text-xs font-mono font-bold flex items-center justify-center">
            {getItemCount()}
          </span>
        </button>
      )}

      {/* Mobile Cart Drawer */}
      <CartDrawer
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onCheckout={() => {
          setCartDrawerOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* Variant Modal */}
      <VariantModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onComplete={handleCheckout}
        isProcessing={isProcessing}
      />

      {/* Receipt */}
      <ReceiptPrint receipt={receipt} onClose={() => setReceipt(null)} />

      {/* Bottom Bar (Mobile) */}
      <BottomBar />
    </div>
  );
}
