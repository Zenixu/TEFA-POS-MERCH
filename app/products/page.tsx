"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import BottomBar from "@/components/layout/BottomBar";
import { formatRupiah, cn } from "@/lib/utils";
import { SIZE_ORDER } from "@/lib/constants";
import {
  Plus,
  Search,
  Package,
  Edit3,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Tag,
  Loader2,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  category: { id: string; name: string };
  brand: string | null;
  imageUrl: string | null;
  isActive: boolean;
  variants: Variant[];
}

interface Variant {
  id: string;
  size: string;
  color: string;
  colorHex: string | null;
  sku: string;
  stock: number;
  price: number | null;
}

interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [uploadingState, setUploadingState] = useState(false);
  const [saving, setSaving] = useState(false);
  const [useSizes, setUseSizes] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [colorEntries, setColorEntries] = useState<{ color: string; colorHex: string; stock: number }[]>([
    { color: "Hitam", colorHex: "#1A1A1A", stock: 0 },
  ]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: 0,
    category: "",
    brand: "",
    imageUrl: "",
  });

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error("API Error:", data);
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
        if (data.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [formData.category]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      basePrice: 0,
      category: categories[0]?.id || "",
      brand: "",
      imageUrl: "",
    });
    setColorEntries([{ color: "Hitam", colorHex: "#1A1A1A", stock: 0 }]);
    setSelectedSizes(["S", "M", "L", "XL"]);
    setUseSizes(true);
    setEditingProductId(null);
  };

  const handleEditClick = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      basePrice: product.basePrice,
      category: product.category?.id || "",
      brand: product.brand || "",
      imageUrl: product.imageUrl || "",
    });
    // We only load product details, variants can be appended as new color entries
    setColorEntries([{ color: "", colorHex: "#1A1A1A", stock: 0 }]);
    setEditingProductId(product.id);
    setShowCreateForm(true);
  };

  const handleCreateProduct = async () => {
    setSaving(true);
    try {
      // Build variants array from colorEntries × selectedSizes
      const variants: { size: string; color: string; colorHex: string; stock: number }[] = [];
      for (const entry of colorEntries) {
        if (!entry.color.trim()) continue;
        if (useSizes) {
          for (const size of selectedSizes) {
            variants.push({
              size,
              color: entry.color,
              colorHex: entry.colorHex,
              stock: entry.stock,
            });
          }
        } else {
          variants.push({
            size: "ONE_SIZE",
            color: entry.color,
            colorHex: entry.colorHex,
            stock: entry.stock,
          });
        }
      }

      const url = editingProductId ? `/api/products/${editingProductId}` : "/api/products";
      const method = editingProductId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, variants }),
      });
      if (res.ok) {
        setShowCreateForm(false);
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      console.error("Create error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });
      if (res.ok) {
        setNewCategoryName("");
        fetchCategories();
      } else {
        alert("Gagal membuat kategori, mungkin sudah ada.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Hapus kategori ini? Pastikan tidak ada produk yang menggunakannya.")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCategories();
      } else {
        alert("Gagal menghapus kategori. Pastikan kosong.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingState(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Gagal mengunggah gambar");
    } finally {
      setUploadingState(false);
      e.target.value = ""; // reset
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleStockUpdate = async (variantId: string) => {
    const newStock = editingStock[variantId];
    if (newStock === undefined) return;
    try {
      await fetch(`/api/variants/${variantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      setEditingStock((prev) => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });
      fetchProducts();
    } catch (error) {
      console.error("Stock update error:", error);
    }
  };

  const totalStock = products.reduce(
    (s, p) => s + p.variants.reduce((vs, v) => vs + v.stock, 0),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] xl:pl-[240px]">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-4 md:px-6 gap-4">
          <h1 className="text-lg font-bold text-foreground whitespace-nowrap">
            📦 Manajemen Produk
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk..."
                className="h-9 pl-9 pr-4 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-navy-400/40 w-64"
              />
            </div>
            <button
              onClick={() => setShowCategoryManager(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-lg bg-navy-50 text-navy-600 text-sm font-medium hover:bg-navy-100 transition-colors"
            >
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Kategori</span>
            </button>
            <button
              onClick={() => { resetForm(); setShowCreateForm(true); }}
              className="flex items-center gap-2 h-9 px-4 rounded-lg bg-emerald-400 text-white text-sm font-medium hover:bg-emerald-500 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Produk</span>
            </button>
          </div>
        </header>

        <main className="p-4 md:p-6 bottom-bar-space">
          {/* Summary */}
          <div className="flex gap-4 mb-6 text-sm">
            <div className="bg-white rounded-lg border border-border px-4 py-2">
              <span className="text-muted">Total Produk:</span>{" "}
              <span className="font-bold font-mono">{products.length}</span>
            </div>
            <div className="bg-white rounded-lg border border-border px-4 py-2">
              <span className="text-muted">Total Stok:</span>{" "}
              <span className="font-bold font-mono">{totalStock} pcs</span>
            </div>
          </div>

          {/* Category Management Modal */}
          {showCategoryManager && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCategoryManager(false)} />
              <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl p-6 shadow-xl animate-scale-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2"><Tag className="w-5 h-5"/> Atur Kategori</h2>
                  <button onClick={() => setShowCategoryManager(false)} className="w-8 h-8 rounded-full bg-background flex items-center justify-center hover:bg-navy-50"><X className="w-4 h-4"/></button>
                </div>
                
                <div className="flex gap-2 mb-6">
                  <input 
                    type="text" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value.toUpperCase())}
                    placeholder="Nama Kategori Baru"
                    className="flex-1 h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-navy-400/40 uppercase"
                  />
                  <button onClick={handleCreateCategory} disabled={!newCategoryName.trim()} className="h-10 px-4 rounded-lg bg-navy-600 text-white text-sm font-bold hover:bg-navy-700 disabled:opacity-50">
                    Tambah
                  </button>
                </div>

                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {categories.length === 0 && <p className="text-sm text-muted text-center py-4">Belum ada kategori</p>}
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
                      <div>
                        <p className="font-bold text-sm">{cat.name}</p>
                        <p className="text-[10px] text-muted">{cat._count?.products || 0} Produk ditautkan</p>
                      </div>
                      <button onClick={() => handleDeleteCategory(cat.id)} disabled={(cat._count?.products || 0) > 0} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-red-50 disabled:opacity-30">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showCreateForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowCreateForm(false)}
              />
              <div className="relative bg-white w-full max-w-lg mx-4 rounded-2xl shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-border rounded-t-2xl">
                  <h2 className="text-lg font-bold">{editingProductId ? "Edit Produk" : "Tambah Produk Baru"}</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="w-8 h-8 rounded-full bg-background flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Nama Produk
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-navy-400/40"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Kategori
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-navy-400/40 uppercase"
                    >
                      <option value="" disabled>Pilih Kategori</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        Harga Dasar (Rp)
                      </label>
                      <input
                        type="number"
                        value={formData.basePrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            basePrice: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full h-10 px-3 rounded-lg border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-navy-400/40"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) =>
                          setFormData({ ...formData, brand: e.target.value })
                        }
                        className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-navy-400/40"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Gambar Produk
                    </label>
                    <div className="space-y-3">
                      {formData.imageUrl && (
                        <div className="relative w-full aspect-video rounded-xl border border-border overflow-hidden bg-navy-50 group">
                          <img 
                            src={formData.imageUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, imageUrl: "" })}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploadingState}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className={cn(
                            "flex items-center gap-2 h-10 px-4 rounded-lg border border-border text-sm font-medium cursor-pointer transition-colors shrink-0",
                            uploadingState ? "bg-navy-50 text-muted" : "bg-white hover:bg-navy-50 text-foreground"
                          )}
                        >
                          {uploadingState ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                          {uploadingState ? "Mengunggah..." : "Pilih File"}
                        </label>
                        <div className="flex-1">
                          <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) =>
                              setFormData({ ...formData, imageUrl: e.target.value })
                            }
                            placeholder="Atau paste URL gambar..."
                            className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-navy-400/40"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ===== VARIANT BUILDER ===== */}
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase text-muted tracking-wider">Varian Produk</h4>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useSizes}
                          onChange={(e) => setUseSizes(e.target.checked)}
                          className="w-4 h-4 rounded border-border accent-emerald-500"
                        />
                        <span className="text-muted text-xs">Gunakan Ukuran (S, M, L, ..)</span>
                      </label>
                    </div>

                    {/* Size Selection */}
                    {useSizes && (
                      <div className="mb-4">
                        <label className="text-xs font-medium text-muted mb-2 block">Ukuran yang tersedia:</label>
                        <div className="flex flex-wrap gap-2">
                          {SIZE_ORDER.map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => {
                                setSelectedSizes((prev) =>
                                  prev.includes(sz)
                                    ? prev.filter((s) => s !== sz)
                                    : [...prev, sz]
                                );
                              }}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                selectedSizes.includes(sz)
                                  ? "bg-navy-600 text-white border-navy-600"
                                  : "bg-white text-muted border-border hover:border-navy-300"
                              )}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Color Entries */}
                    <div className="space-y-3">
                      <label className="text-xs font-medium text-muted block">Warna & Stok per warna:</label>
                      {colorEntries.map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="color"
                            value={entry.colorHex}
                            onChange={(e) => {
                              const updated = [...colorEntries];
                              updated[idx].colorHex = e.target.value;
                              setColorEntries(updated);
                            }}
                            className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={entry.color}
                            onChange={(e) => {
                              const updated = [...colorEntries];
                              updated[idx].color = e.target.value;
                              setColorEntries(updated);
                            }}
                            placeholder="Nama warna"
                            className="flex-1 h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-navy-400/40"
                          />
                          <div className="relative w-24">
                            <input
                              type="number"
                              min="0"
                              value={entry.stock}
                              onChange={(e) => {
                                const updated = [...colorEntries];
                                updated[idx].stock = parseInt(e.target.value) || 0;
                                setColorEntries(updated);
                              }}
                              className="w-full h-9 px-3 rounded-lg border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-navy-400/40"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted">stok</span>
                          </div>
                          {colorEntries.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setColorEntries(colorEntries.filter((_, i) => i !== idx))}
                              className="w-8 h-8 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setColorEntries([...colorEntries, { color: "", colorHex: "#9CA3AF", stock: 0 }])}
                        className="flex items-center gap-1.5 text-xs text-navy-600 hover:text-navy-800 font-medium transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Warna
                      </button>
                    </div>

                    {/* Preview */}
                    {colorEntries.filter(e => e.color.trim()).length > 0 && (
                      <div className="mt-3 p-3 rounded-lg bg-background text-xs text-muted">
                        <span className="font-medium">Preview:</span>{" "}
                        {useSizes
                          ? `${colorEntries.filter(e => e.color.trim()).length} warna × ${selectedSizes.length} ukuran = ${colorEntries.filter(e => e.color.trim()).length * selectedSizes.length} varian`
                          : `${colorEntries.filter(e => e.color.trim()).length} warna (tanpa ukuran) = ${colorEntries.filter(e => e.color.trim()).length} varian`
                        }
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Deskripsi
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-navy-400/40"
                    />
                  </div>
                  <button
                    onClick={handleCreateProduct}
                    disabled={saving || !formData.name || !formData.basePrice || colorEntries.filter(e => e.color.trim()).length === 0}
                    className="w-full h-11 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Menyimpan..." : "Simpan Produk"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Table */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-border p-4 animate-pulse"
                >
                  <div className="h-5 bg-navy-50 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-navy-50 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => {
                const isExpanded = expandedProduct === product.id;
                const productStock = product.variants.reduce(
                  (s, v) => s + v.stock,
                  0
                );

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-border overflow-hidden"
                  >
                    {/* Product Row */}
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-12 h-12 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-navy-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate">
                            {product.name}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-navy-50 text-navy-600 font-medium">
                            {product.category?.name || "Uncategorized"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                          {product.brand && <span>{product.brand}</span>}
                          <span className="font-mono font-medium">
                            {formatRupiah(product.basePrice)}
                          </span>
                          <span
                            className={cn(
                              "font-mono",
                              productStock < 5
                                ? "text-warning font-bold"
                                : ""
                            )}
                          >
                            Stok: {productStock}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="text-muted hover:text-navy-600 transition-colors p-2"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-muted hover:text-danger transition-colors p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setExpandedProduct(isExpanded ? null : product.id)
                          }
                          className="text-muted hover:text-foreground transition-colors p-2"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Variants */}
                    {isExpanded && (
                      <div className="border-t border-border bg-background/50 p-4 animate-fade-in">
                        <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                          Variant ({product.variants.length})
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-xs text-muted uppercase border-b border-border">
                                <th className="text-left py-2 pr-4">Warna</th>
                                <th className="text-left py-2 pr-4">Ukuran</th>
                                <th className="text-left py-2 pr-4">SKU</th>
                                <th className="text-right py-2 pr-4">Stok</th>
                                <th className="text-right py-2">Aksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.variants
                                .sort(
                                  (a, b) =>
                                    SIZE_ORDER.indexOf(a.size) -
                                    SIZE_ORDER.indexOf(b.size)
                                )
                                .map((v) => (
                                  <tr
                                    key={v.id}
                                    className="border-b border-border/60 last:border-0"
                                  >
                                    <td className="py-2 pr-4">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-4 h-4 rounded-full border border-border"
                                          style={{
                                            backgroundColor:
                                              v.colorHex || "#ccc",
                                          }}
                                        />
                                        <span>{v.color}</span>
                                      </div>
                                    </td>
                                    <td className="py-2 pr-4 font-medium">
                                      {v.size}
                                    </td>
                                    <td className="py-2 pr-4 font-mono text-xs text-muted">
                                      {v.sku}
                                    </td>
                                    <td className="py-2 pr-4 text-right">
                                      {editingStock[v.id] !== undefined ? (
                                        <input
                                          type="number"
                                          value={editingStock[v.id]}
                                          onChange={(e) =>
                                            setEditingStock({
                                              ...editingStock,
                                              [v.id]:
                                                parseInt(e.target.value) || 0,
                                            })
                                          }
                                          className="w-16 h-7 px-2 rounded border border-navy-400 text-sm font-mono text-right focus:outline-none"
                                          autoFocus
                                        />
                                      ) : (
                                        <span
                                          className={cn(
                                            "font-mono font-medium",
                                            v.stock === 0
                                              ? "text-danger"
                                              : v.stock < 5
                                              ? "text-warning"
                                              : "text-foreground"
                                          )}
                                        >
                                          {v.stock}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2 text-right">
                                      {editingStock[v.id] !== undefined ? (
                                        <div className="flex justify-end gap-1">
                                          <button
                                            onClick={() =>
                                              handleStockUpdate(v.id)
                                            }
                                            className="text-emerald-500 hover:text-emerald-600 p-1"
                                          >
                                            <Save className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() =>
                                              setEditingStock((prev) => {
                                                const next = { ...prev };
                                                delete next[v.id];
                                                return next;
                                              })
                                            }
                                            className="text-muted hover:text-danger p-1"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            setEditingStock({
                                              ...editingStock,
                                              [v.id]: v.stock,
                                            })
                                          }
                                          className="text-muted hover:text-navy-600 p-1"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <BottomBar />
    </div>
  );
}
