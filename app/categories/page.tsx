"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import BottomBar from "@/components/layout/BottomBar";
import {
  Tags,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Package,
  AlertTriangle,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  _count: { products: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menambah kategori");
        return;
      }
      setNewName("");
      setShowAdd(false);
      fetchCategories();
    } catch {
      setError("Gagal menghubungi server");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    setError("");
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal memperbarui kategori");
        return;
      }
      setEditingId(null);
      fetchCategories();
    } catch {
      setError("Gagal menghubungi server");
    }
  };

  const handleDelete = async (id: string) => {
    setError("");
    setDeletingId(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menghapus kategori");
        return;
      }
      fetchCategories();
    } catch {
      setError("Gagal menghubungi server");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] xl:pl-[240px]">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center">
              <Tags className="w-5 h-5 text-navy-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Kategori</h1>
              <p className="text-xs text-muted">
                Kelola kategori produk merchandise
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowAdd(true);
              setError("");
            }}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-emerald-400 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah
          </button>
        </header>

        <main className="p-4 md:p-6 bottom-bar-space">
          {/* Error Banner */}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError("")} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Add Form */}
          {showAdd && (
            <div className="mb-6 bg-white rounded-xl border border-border p-4 shadow-sm animate-slide-up">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Tambah Kategori Baru
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Nama kategori (contoh: HOODIE)"
                  autoFocus
                  className="flex-1 h-10 px-4 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                />
                <button
                  onClick={handleCreate}
                  disabled={creating || !newName.trim()}
                  className="h-10 px-4 rounded-lg bg-emerald-400 hover:bg-emerald-500 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Simpan
                </button>
                <button
                  onClick={() => {
                    setShowAdd(false);
                    setNewName("");
                  }}
                  className="h-10 px-3 rounded-lg border border-border hover:bg-navy-50 text-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Category List */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-border p-4 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-navy-50 rounded-lg" />
                      <div>
                        <div className="h-4 bg-navy-50 rounded w-32 mb-1" />
                        <div className="h-3 bg-navy-50 rounded w-20" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <Tags className="w-12 h-12 text-navy-200 mx-auto mb-3" />
              <p className="text-muted text-sm">Belum ada kategori.</p>
              <p className="text-muted text-xs mt-1">
                Klik tombol &quot;Tambah&quot; untuk membuat kategori pertama.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-xl border border-border p-4 flex items-center justify-between group hover:border-navy-200 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
                      <Tags className="w-5 h-5 text-navy-400" />
                    </div>
                    {editingId === cat.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(cat.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        className="flex-1 h-9 px-3 rounded-lg border border-emerald-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                      />
                    ) : (
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {cat.name}
                        </p>
                        <p className="text-xs text-muted flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {cat._count.products} produk
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 ml-3">
                    {editingId === cat.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(cat.id)}
                          className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="w-8 h-8 rounded-lg bg-navy-50 text-muted hover:bg-navy-100 flex items-center justify-center transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditName(cat.name);
                            setError("");
                          }}
                          className="w-8 h-8 rounded-lg text-muted hover:bg-navy-50 hover:text-navy-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Hapus kategori "${cat.name}"?`
                              )
                            ) {
                              handleDelete(cat.id);
                            }
                          }}
                          disabled={
                            deletingId === cat.id || cat._count.products > 0
                          }
                          title={
                            cat._count.products > 0
                              ? "Tidak bisa hapus — masih ada produk"
                              : "Hapus kategori"
                          }
                          className="w-8 h-8 rounded-lg text-muted hover:bg-red-50 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {deletingId === cat.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <BottomBar />
    </div>
  );
}
