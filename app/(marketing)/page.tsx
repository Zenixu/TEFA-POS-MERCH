import Link from "next/link";
import { Store, ChevronRight, Zap, BarChart3, Smartphone } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500/30">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">TEFA MERCH</span>
        </div>
        
        <Link 
          href="/login" 
          className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center gap-2"
        >
          Masuk / Daftar
          <ChevronRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden pb-20">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop" 
            alt="Clothing Store Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/80 to-zinc-950"></div>
          
          {/* Accent glow */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] pointer-events-none" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-8 animate-fade-in shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistem POS Modern untuk Bisnis Retail Anda
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-slide-up leading-tight">
            Kelola Toko Merch Anda <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Lebih Cepat & Pintar
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "100ms" }}>
            Tinggalkan cara manual. Pantau stok produk, catat penjualan harian, dan analisis pendapatan Anda secara real-time dari mana saja.
          </p>

          <div className="animate-slide-up mb-20" style={{ animationDelay: "200ms" }}>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-zinc-900 font-bold text-lg hover:bg-zinc-200 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
            >
              Coba Sekarang Gratis
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: "300ms" }}>
            
            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] p-8 rounded-3xl text-left hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
                <Smartphone className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Desain Responsif</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Akses sistem kasir dari tablet, laptop, atau smartphone dengan tampilan yang selalu optimal dan mudah digunakan.</p>
            </div>

            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] p-8 rounded-3xl text-left hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] group-hover:bg-emerald-500/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
                  <Zap className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Transaksi Kilat</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">Proses pembayaran tunai, kartu, dan QRIS dalam hitungan detik. Mendukung mode offline untuk toko tanpa internet.</p>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] p-8 rounded-3xl text-left hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all">
                <BarChart3 className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Laporan Otomatis</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Pantau produk terlaris, ketersediaan stok kritis, dan grafik pendapatan harian secara langsung dari dashboard interaktif.</p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
