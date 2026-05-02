"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import BottomBar from "@/components/layout/BottomBar";
import { Loader2, AlertCircle, CheckCircle2, User, KeyRound, Save, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "", // read-only
    role: "", // read-only
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    // Fetch current user info
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setFormData((prev) => ({
            ...prev,
            firstName: data.user.firstName || "",
            lastName: data.user.lastName || "",
            email: data.user.email || "",
            role: data.user.role || "",
          }));
          // We don't have direct info if it's a google user from /me unless we expose provider
          // We will just try to allow password change, API will reject if google user.
        } else {
          router.push("/login");
        }
      })
      .catch(() => {
        setError("Gagal memuat data profil");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
      setError("Password baru tidak cocok");
      return;
    }

    if (formData.newPassword && !formData.currentPassword) {
      setError("Masukkan password saat ini untuk merubah password");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal memperbarui profil");
        return;
      }

      setSuccess(data.message || "Profil berhasil diperbarui!");
      // Clear password fields on success
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
      
      // Update session locally if using NextAuth
      // Note: A full page reload might be needed to refresh NextAuth session completely if it stores name
      setTimeout(() => {
          window.location.reload();
      }, 1500);

    } catch {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <Sidebar />
      <div className="md:pl-[72px] xl:pl-[240px]">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border h-16 flex items-center px-4 md:px-6">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 -ml-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            Pengaturan Profil
          </h1>
        </header>

        <main className="p-4 md:p-6 max-w-3xl mx-auto bottom-bar-space">
          {error && (
            <div className="mb-6 flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-2 p-4 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Informasi Dasar */}
                <section>
                  <div className="flex items-center gap-2 mb-4 text-zinc-800">
                    <User className="w-5 h-5" />
                    <h2 className="text-base font-semibold">Informasi Dasar</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-zinc-600 mb-2">Nama Depan</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full h-11 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-600 mb-2">Nama Belakang</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full h-11 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-600 mb-2">Email (Tidak dapat diubah)</label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full h-11 px-4 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-500 cursor-not-allowed text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-600 mb-2">Peran / Akses</label>
                      <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 text-sm font-medium">
                        {formData.role}
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-zinc-100" />

                {/* Ganti Password */}
                <section>
                  <div className="flex items-center gap-2 mb-4 text-zinc-800">
                    <KeyRound className="w-5 h-5" />
                    <h2 className="text-base font-semibold">Ganti Password</h2>
                  </div>
                  <p className="text-sm text-zinc-500 mb-5">
                    Kosongkan bagian ini jika Anda tidak ingin mengubah password. (Jika mendaftar via Google, Anda tidak dapat mengubah password di sini).
                  </p>

                  <div className="space-y-5 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-zinc-600 mb-2">Password Saat Ini</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full h-11 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-600 mb-2">Password Baru</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full h-11 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-600 mb-2">Konfirmasi Password Baru</label>
                      <input
                        type="password"
                        name="confirmNewPassword"
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full h-11 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                </section>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-sm shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
      <BottomBar />
    </div>
  );
}
