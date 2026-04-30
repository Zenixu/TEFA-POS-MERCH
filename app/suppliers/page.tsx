"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import BottomBar from "@/components/layout/BottomBar";
import { Search, Plus, Edit3, Trash2, X, Save, Truck } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  _count?: { purchaseOrders: number };
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    phone: "",
  });

  const fetchSuppliers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/suppliers?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setSuppliers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const resetForm = () => {
    setFormData({ name: "", contactName: "", phone: "" });
    setEditingId(null);
  };

  const handleEditClick = (s: Supplier) => {
    setFormData({
      name: s.name,
      contactName: s.contactName || "",
      phone: s.phone || "",
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setSaving(true);
    try {
      const url = editingId ? `/api/suppliers/${editingId}` : "/api/suppliers";
      const method = editingId ? "PUT" : "POST";
      
      const payload = {
        name: formData.name,
        contactName: formData.contactName || null,
        phone: formData.phone || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (res.ok) {
        setShowForm(false);
        resetForm();
        fetchSuppliers();
      } else {
        alert(data.error || "Gagal menyimpan data.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, count: number) => {
    if (count > 0) {
      alert("Tidak dapat menghapus supplier yang memiliki riwayat PO.");
      return;
    }
    if (!confirm("Hapus supplier ini?")) return;
    
    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
      if (res.ok) fetchSuppliers();
      else alert("Gagal menghapus.");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] xl:pl-[240px]">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-4 md:px-6 gap-4">
          <h1 className="text-lg font-bold text-foreground whitespace-nowrap">
            🚚 Manajemen Supplier
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari vendor..."
                className="h-9 pl-9 pr-4 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-navy-400/40 w-64"
              />
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 h-9 px-4 rounded-lg bg-emerald-400 text-white text-sm font-medium hover:bg-emerald-500 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah</span>
            </button>
          </div>
        </header>

        <main className="p-4 md:p-6 bottom-bar-space">
          {/* Modal Form */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
              <div className="relative bg-white w-full max-w-sm mx-4 rounded-2xl p-6 shadow-xl animate-scale-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">{editingId ? "Edit Supplier" : "Tambah Supplier"}</h2>
                  <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full hover:bg-navy-50 flex items-center justify-center text-muted">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nama Instansi/Vendor *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-navy-400/40"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nama Kontak Person</label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-navy-400/40"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nomor HP / Telepon</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="08..."
                      className="w-full h-10 px-3 rounded-lg border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-navy-400/40"
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving || !formData.name}
                    className="w-full h-11 rounded-xl bg-navy-600 hover:bg-navy-700 text-white font-bold transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4"/>
                    {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
             <div className="space-y-3">
               {[1,2,3].map(i => (
                 <div key={i} className="bg-white rounded-xl border border-border p-4 animate-pulse h-16" />
               ))}
             </div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-20 text-muted text-sm">
              Belum ada data supplier vendor.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted uppercase border-b border-border bg-background/50">
                      <th className="text-left py-3 px-4">Nama Vendor / Instansi</th>
                      <th className="text-left py-3 px-4">Kontak Person</th>
                      <th className="text-left py-3 px-4">Nomor HP/Telp</th>
                      <th className="text-center py-3 px-4">Total PO</th>
                      <th className="text-right py-3 px-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((s) => (
                      <tr key={s.id} className="border-b border-border/60 hover:bg-background/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 flex-shrink-0">
                              <Truck className="w-4 h-4" />
                            </div>
                            <span className="font-semibold">{s.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{s.contactName || "-"}</td>
                        <td className="py-3 px-4 font-mono text-muted">{s.phone || "-"}</td>
                        <td className="py-3 px-4 text-center font-mono font-medium">{s._count?.purchaseOrders || 0}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEditClick(s)} className="text-muted hover:text-navy-600 p-2 transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(s.id, s._count?.purchaseOrders || 0)} 
                              className={`p-2 transition-colors ${s._count?.purchaseOrders ? 'opacity-30 cursor-not-allowed' : 'text-muted hover:text-danger'}`}
                              disabled={(s._count?.purchaseOrders || 0) > 0}
                              title={(s._count?.purchaseOrders || 0) > 0 ? "Tidak bisa dihapus" : "Hapus"}
                            >
                              <Trash2 className="w-4 h-4" />
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
      <BottomBar />
    </div>
  );
}
