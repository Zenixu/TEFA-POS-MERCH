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

export default function POSPageClient() {
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

  const { items, getItemCount, clearCart } = useCartStore();

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
          if (!search && !category) {
            await db.products.clear();
            await db.products.bulkPut(data);
          }
        } else {
          const cached = await db.products.toArray();
          setProducts(cached);
        }
      } else {
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
      const offlineCats = await db.categories.toArray();
      setCategories(offlineCats);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

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
          }
        } catch (e) {}
      }
    };

    const handleOnline = () => {
      syncOrders();
      fetchProducts();
    };

    window.addEventListener("online", handleOnline);
    if (navigator.onLine) syncOrders();
    return () => window.removeEventListener("online", handleOnline);
  }, [fetchProducts]);

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
      changeAmount: payload.paymentMethod === "CASH" && payload.cashReceived ? payload.cashReceived - payload.total : undefined,
    };

    setReceipt(receiptData);
    setCheckoutOpen(false);
    clearCart();
    fetchProducts();
  };

  const handleCheckout = async (payload: OrderPayload) => {
    setIsProcessing(true);
    try {
      if (!navigator.onLine) {
        const offlineOrder = { id: crypto.randomUUID(), syncStatus: "PENDING" as const, createdAt: new Date(), payload };
        await db.pendingOrders.put(offlineOrder);
        buildReceipt(payload, `OFFLINE-${offlineOrder.id.slice(0, 8).toUpperCase()}`);
        alert("Offline checkout saved.");
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Gagal");
        return;
      }

      const order = await res.json();
      const customerName = order.customer ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim() : undefined;
      buildReceipt(payload, order.orderNumber, customerName);
    } catch (error) {
      const offlineOrder = { id: crypto.randomUUID(), syncStatus: "PENDING" as const, createdAt: new Date(), payload };
      await db.pendingOrders.put(offlineOrder);
      buildReceipt(payload, `OFFLINE-${offlineOrder.id.slice(0, 8).toUpperCase()}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] xl:pl-[240px] flex">
        <div className="flex-1 flex flex-col min-h-screen">
          <Header searchValue={searchDebounce} onSearchChange={setSearchDebounce} title="Kasir POS" />
          <main className="flex-1 p-4 md:p-6 bottom-bar-space">
            <div className="mb-4">
              <ProductGridFilter selectedCategory={category} onCategoryChange={setCategory} categories={categories} />
            </div>
            {loading ? (
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
                 {Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-square bg-navy-50/50 animate-pulse rounded-xl" />)}
               </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-muted">Tidak ada produk.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
                {products.map((product) => <ProductCard key={product.id} product={product} onClick={setSelectedProduct} />)}
              </div>
            )}
          </main>
        </div>
        <CartPanel onCheckout={() => setCheckoutOpen(true)} />
      </div>
      {items.length > 0 && (
        <button onClick={() => setCartDrawerOpen(true)} className="xl:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg flex items-center justify-center">
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-navy-600 text-white text-xs flex items-center justify-center">{getItemCount()}</span>
        </button>
      )}
      <CartDrawer open={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} onCheckout={() => { setCartDrawerOpen(false); setCheckoutOpen(true); }} />
      <VariantModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} onComplete={handleCheckout} isProcessing={isProcessing} />
      <ReceiptPrint receipt={receipt} onClose={() => setReceipt(null)} />
      <BottomBar />
    </div>
  );
}
