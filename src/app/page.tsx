"use client";

import { useState, useEffect, useCallback, useRef, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Bot,
  MessageSquare,
  Zap,
  Shield,
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Send,
  ArrowRight,
  Trash2,
  Globe,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";

/* ─── Types ─── */
interface BotReg {
  id: string;
  name: string;
  whatsappNumber: string;
  email: string | null;
  botType: string;
  description: string | null;
  status: string;
  createdAt: string;
}

const BOT_TYPES = [
  { value: "customer-service", label: "Customer Service" },
  { value: "marketing", label: "Marketing & Promo" },
  { value: "transaction", label: "Transaksi & Pembayaran" },
  { value: "notification", label: "Notifikasi & Reminder" },
  { value: "ai-chatbot", label: "AI Chatbot" },
  { value: "other", label: "Lainnya" },
];

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  pending: { label: "Menunggu", class: "status-pending" },
  approved: { label: "Disetujui", class: "status-approved" },
  rejected: { label: "Ditolak", class: "status-rejected" },
};

/* ─── Scroll Observer Hook ─── */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("scroll-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    document
      .querySelectorAll(
        ".scroll-fade, .scroll-blur, .scroll-fade-left, .scroll-fade-right, .scroll-fade-scale"
      )
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function Home() {
  const [activeTab, setActiveTab] = useState<"beranda" | "daftar" | "dashboard">("beranda");
  const [bots, setBots] = useState<BotReg[]>([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  /* fetch bots */
  const fetchBots = useCallback(async () => {
    try {
      const res = await fetch("/api/bots");
      const json = await res.json();
      if (json.data) setBots(json.data);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    if (activeTab === "dashboard") fetchBots();
  }, [activeTab, fetchBots]);

  useScrollReveal();

  /* form submit */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = {
      name: (fd.get("name") as string)?.trim(),
      whatsappNumber: (fd.get("whatsappNumber") as string)?.trim(),
      email: (fd.get("email") as string)?.trim() || null,
      botType: (fd.get("botType") as string) || "customer-service",
      description: (fd.get("description") as string)?.trim() || null,
    };

    if (!data.name || !data.whatsappNumber) {
      toast.error("Nama dan nomor WhatsApp wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Terjadi kesalahan");
        return;
      }
      toast.success("Pendaftaran berhasil! Bot Anda sedang menunggu persetujuan.");
      form.reset();
      setActiveTab("dashboard");
    } catch {
      toast.error("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  /* update status */
  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/bots/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "Gagal update status");
        return;
      }
      toast.success(`Status diperbarui ke ${STATUS_MAP[status]?.label || status}`);
      fetchBots();
    } catch {
      toast.error("Gagal terhubung ke server");
    }
  }

  /* delete */
  async function deleteBot(id: string) {
    try {
      const res = await fetch(`/api/bots/${id}/status`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Gagal menghapus");
        return;
      }
      toast.success("Pendaftaran berhasil dihapus");
      fetchBots();
    } catch {
      toast.error("Gagal terhubung ke server");
    }
  }

  /* scroll to tab */
  function scrollToSection(tab: string) {
    setActiveTab(tab as "beranda" | "daftar" | "dashboard");
    setMobileMenu(false);
    if (tab === "daftar") {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 nav-blur border-b border-dark-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-wa-green/10 border border-wa-green/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-wa-green" />
            </div>
            <span className="font-semibold text-white tracking-tight">WaBot Hub</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {(["beranda", "daftar", "dashboard"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => scrollToSection(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-wa-green/10 text-wa-green"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab === "beranda" ? "Beranda" : tab === "daftar" ? "Daftar Bot" : "Dashboard"}
              </button>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden border-t border-dark-border bg-[#0a0a0a]/95 backdrop-blur-sm">
            <div className="px-4 py-3 space-y-1">
              {(["beranda", "daftar", "dashboard"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => scrollToSection(tab)}
                  className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab
                      ? "bg-wa-green/10 text-wa-green"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab === "beranda" ? "Beranda" : tab === "daftar" ? "Daftar Bot" : "Dashboard"}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 pt-14">
        {/* ═══════ BERANDA TAB ═══════ */}
        {activeTab === "beranda" && (
          <>
            {/* ─── HERO ─── */}
            <section className="relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-wa-green/8 blur-[120px] animate-glow-drift pointer-events-none" />
              <div className="absolute top-20 right-10 w-2 h-2 rounded-full bg-wa-green animate-pulse-dot pointer-events-none" />
              <div className="absolute top-40 left-20 w-1.5 h-1.5 rounded-full bg-wa-green/60 animate-pulse-dot pointer-events-none" style={{ animationDelay: "0.7s" }} />

              <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center relative">
                {/* Left: Text */}
                <div>
                  <div className="animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-wa-green/20 bg-wa-green/5 text-wa-green text-xs font-medium mb-6">
                      <span className="w-1.5 h-1.5 rounded-full bg-wa-green animate-pulse-dot" />
                      Platform Bot WhatsApp #1
                    </div>
                  </div>

                  <h1 className="animate-fade-in-up text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                    Daftarkan Bot
                    <br />
                    <span className="text-wa-green">WhatsApp</span> Anda
                  </h1>

                  <p className="animate-fade-in-up mt-5 text-gray-400 text-base md:text-lg leading-relaxed max-w-md" style={{ animationDelay: "0.15s" }}>
                    Buat, kelola, dan monitor bot WhatsApp untuk bisnis Anda. Satu platform untuk semua kebutuhan otomasi chat.
                  </p>

                  <div className="animate-fade-in-up flex flex-wrap gap-3 mt-8" style={{ animationDelay: "0.3s" }}>
                    <button
                      onClick={() => scrollToSection("daftar")}
                      className="btn-primary px-6 py-3 rounded-xl bg-wa-green text-dark-bg font-semibold text-sm flex items-center gap-2 animate-green-glow"
                    >
                      Daftarkan Bot
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollToSection("dashboard")}
                      className="btn-outline px-6 py-3 rounded-xl border border-dark-border-hover text-white font-medium text-sm flex items-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Lihat Dashboard
                    </button>
                  </div>
                </div>

                {/* Right: Chat Mockup */}
                <div className="animate-fade-in-right hidden md:flex justify-center">
                  <div className="animate-float w-full max-w-sm">
                    <div className="rounded-2xl border border-dark-border-hover bg-dark-card overflow-hidden shadow-2xl shadow-black/40">
                      {/* Chat header */}
                      <div className="px-4 py-3 bg-wa-green-dark flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">WaBot Assistant</div>
                          <div className="text-white/60 text-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-300" />
                            Online
                          </div>
                        </div>
                      </div>

                      {/* Chat messages */}
                      <div className="p-4 space-y-3 min-h-[280px] bg-[#0d1117]">
                        {/* Bot message */}
                        <div className="flex gap-2 animate-chat-bounce" style={{ animationDelay: "0.2s" }}>
                          <div className="w-6 h-6 rounded-full bg-wa-green/20 flex items-center justify-center shrink-0 mt-1">
                            <Bot className="w-3 h-3 text-wa-green" />
                          </div>
                          <div className="bg-[#1a2332] rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[75%]">
                            <p className="text-sm text-gray-200">
                              Halo! Saya bot WhatsApp Anda. Ada yang bisa saya bantu?
                            </p>
                            <span className="text-[10px] text-gray-500 mt-1 block">10:42</span>
                          </div>
                        </div>

                        {/* User message */}
                        <div className="flex justify-end animate-chat-bounce" style={{ animationDelay: "0.8s" }}>
                          <div className="bg-wa-green-dark rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[75%]">
                            <p className="text-sm text-white">
                              Saya ingin cek status pesanan saya
                            </p>
                            <span className="text-[10px] text-white/50 mt-1 block text-right">10:42</span>
                          </div>
                        </div>

                        {/* Bot typing */}
                        <div className="flex gap-2 animate-chat-bounce" style={{ animationDelay: "1.5s" }}>
                          <div className="w-6 h-6 rounded-full bg-wa-green/20 flex items-center justify-center shrink-0 mt-1">
                            <Bot className="w-3 h-3 text-wa-green" />
                          </div>
                          <div className="bg-[#1a2332] rounded-2xl rounded-tl-sm px-4 py-3">
                            <div className="flex gap-1.5">
                              <span className="typing-dot" />
                              <span className="typing-dot" />
                              <span className="typing-dot" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Chat input */}
                      <div className="px-4 py-3 bg-[#0d1117] border-t border-dark-border flex items-center gap-2">
                        <div className="flex-1 bg-[#1a2332] rounded-full px-4 py-2 text-xs text-gray-500">
                          Ketik pesan...
                        </div>
                        <div className="w-8 h-8 rounded-full bg-wa-green flex items-center justify-center">
                          <Send className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── STATS STRIP ─── */}
            <section className="border-y border-dark-border">
              <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { value: "500+", label: "Bot Terdaftar", icon: Bot },
                  { value: "99.9%", label: "Uptime Server", icon: Shield },
                  { value: "24/7", label: "Support Aktif", icon: Clock },
                  { value: "1.2M+", label: "Pesan / Bulan", icon: MessageSquare },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className="scroll-fade flex items-center gap-3 justify-center md:justify-start"
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="stat-hover w-10 h-10 rounded-xl bg-wa-green/5 border border-wa-green/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-wa-green/70" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ─── FEATURES ─── */}
            <section className="py-20 md:py-24">
              <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-14 scroll-fade">
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Kenapa Pilih <span className="text-wa-green">WaBot Hub</span>?
                  </h2>
                  <p className="text-gray-400 mt-3 max-w-lg mx-auto">
                    Platform terlengkap untuk mengelola bot WhatsApp bisnis Anda dengan fitur-fitur canggih.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      icon: MessageSquare,
                      title: "Auto Reply Cerdas",
                      desc: "Balas pesan masuk secara otomatis dengan template yang bisa dikustomisasi sesuai kebutuhan bisnis Anda.",
                    },
                    {
                      icon: Users,
                      title: "Multi-User Management",
                      desc: "Kelola banyak bot dalam satu dashboard. Cocok untuk agensi atau bisnis dengan beberapa cabang.",
                    },
                    {
                      icon: BarChart3,
                      title: "Analitik Real-time",
                      desc: "Pantau performa bot Anda dengan dashboard analitik yang menampilkan statistik pesan dan respons.",
                    },
                    {
                      icon: Zap,
                      title: "Setup Instan",
                      desc: "Daftar dan konfigurasi bot dalam hitungan menit. Tanpa instalasi rumit, langsung siap pakai.",
                    },
                    {
                      icon: Shield,
                      title: "Keamanan Terjamin",
                      desc: "Enkripsi end-to-end dan autentikasi two-factor untuk melindungi data bisnis Anda.",
                    },
                    {
                      icon: Globe,
                      title: "API Terbuka",
                      desc: "Integrasikan bot WhatsApp Anda dengan sistem CRM, e-commerce, atau tools lainnya via REST API.",
                    },
                  ].map((feat, i) => (
                    <div
                      key={feat.title}
                      className="scroll-fade card-hover group rounded-2xl border border-dark-border bg-dark-card p-6"
                      style={{ transitionDelay: `${i * 80}ms` }}
                    >
                      <div className="w-11 h-11 rounded-xl bg-wa-green/5 border border-wa-green/10 flex items-center justify-center mb-4 group-hover:bg-wa-green/10 group-hover:border-wa-green/20 transition-all duration-300">
                        <feat.icon className="w-5 h-5 text-wa-green/70" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">{feat.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="shimmer-divider max-w-6xl mx-auto" />

            {/* ─── HOW IT WORKS ─── */}
            <section className="py-20 md:py-24">
              <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-14 scroll-fade">
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Cara Kerja
                  </h2>
                  <p className="text-gray-400 mt-3 max-w-md mx-auto">
                    Tiga langkah mudah untuk mulai menggunakan bot WhatsApp Anda.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      step: "01",
                      icon: Send,
                      title: "Daftarkan Bot",
                      desc: "Isi formulir pendaftaran dengan informasi bot dan nomor WhatsApp bisnis Anda. Proses cepat tanpa biaya.",
                    },
                    {
                      step: "02",
                      icon: RefreshCw,
                      title: "Konfigurasi",
                      desc: "Atur pesan balasan otomatis, buat menu interaktif, dan sesuaikan perilaku bot sesuai kebutuhan.",
                    },
                    {
                      step: "03",
                      icon: CheckCircle2,
                      title: "Bot Aktif!",
                      desc: "Setelah disetujui, bot Anda langsung aktif dan mulai melayani pelanggan 24 jam non-stop.",
                    },
                  ].map((item, i) => (
                    <div
                      key={item.step}
                      className={`scroll-fade-${i === 0 ? "left" : i === 2 ? "right" : "scale"} relative`}
                      style={{ transitionDelay: `${i * 120}ms` }}
                    >
                      <div className="card-hover rounded-2xl border border-dark-border bg-dark-card p-6 text-center h-full">
                        <div className="text-5xl font-black text-wa-green/10 absolute top-4 right-6">
                          {item.step}
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-wa-green/5 border border-wa-green/10 flex items-center justify-center mx-auto mb-5">
                          <item.icon className="w-6 h-6 text-wa-green" />
                        </div>
                        <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ─── FAQ ─── */}
            <section className="py-20 border-t border-dark-border">
              <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-12 scroll-fade">
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Pertanyaan Umum
                  </h2>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      q: "Apakah pendaftaran bot gratis?",
                      a: "Ya, pendaftaran bot di WaBot Hub sepenuhnya gratis. Anda hanya perlu mengisi formulir dan menunggu persetujuan dari tim kami. Setelah disetujui, bot Anda langsung bisa digunakan.",
                    },
                    {
                      q: "Berapa lama proses persetujuan?",
                      a: "Proses review dan persetujuan biasanya memakan waktu 1x24 jam kerja. Untuk permintaan dengan volume tinggi, bisa memakan waktu hingga 3 hari kerja.",
                    },
                    {
                      q: "Jenis bot apa saja yang didukung?",
                      a: "Kami mendukung berbagai jenis bot termasuk customer service otomatis, marketing & promo, transaksi & pembayaran, notifikasi & reminder, serta AI chatbot dengan natural language processing.",
                    },
                    {
                      q: "Apakah data saya aman?",
                      a: "Keamanan data adalah prioritas utama kami. Semua data dienkripsi dan disimpan di server yang aman. Kami tidak pernah membagikan informasi pribadi Anda ke pihak ketiga.",
                    },
                    {
                      q: "Bisa integrasi dengan sistem yang sudah ada?",
                      a: "Tentu! WaBot Hub menyediakan REST API yang bisa diintegrasikan dengan CRM, e-commerce platform, atau sistem internal perusahaan Anda. Dokumentasi API tersedia setelah bot disetujui.",
                    },
                  ].map((faq, i) => (
                    <details
                      key={i}
                      className="scroll-fade faq-hover group rounded-xl border border-dark-border bg-dark-card overflow-hidden"
                      style={{ transitionDelay: `${i * 60}ms` }}
                    >
                      <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium text-sm list-none">
                        {faq.q}
                        <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform duration-300" />
                      </summary>
                      <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed border-t border-dark-border pt-3">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </section>

            {/* ─── CTA ─── */}
            <section className="py-20">
              <div className="max-w-6xl mx-auto px-4">
                <div className="scroll-fade-scale relative rounded-3xl border border-wa-green/10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-wa-green-dark/20 via-dark-bg to-dark-bg" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-wa-green/5 blur-[100px] animate-glow-pulse pointer-events-none" />

                  <div className="relative px-6 py-16 md:py-20 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      Siap Membuat Bot WhatsApp Anda?
                    </h2>
                    <p className="text-gray-400 max-w-md mx-auto mb-8">
                      Bergabung dengan ratusan bisnis yang sudah menggunakan WaBot Hub untuk otomasi WhatsApp mereka.
                    </p>
                    <button
                      onClick={() => scrollToSection("daftar")}
                      className="btn-primary px-8 py-3.5 rounded-xl bg-wa-green text-dark-bg font-semibold text-sm animate-green-glow inline-flex items-center gap-2"
                    >
                      Daftar Sekarang — Gratis
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="border-t border-dark-border bg-[#070707]">
              <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
                  {/* Brand */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-wa-green/10 border border-wa-green/20 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-wa-green" />
                      </div>
                      <span className="font-semibold text-white">WaBot Hub</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                      Platform pendaftaran dan pengelolaan bot WhatsApp terpercaya untuk bisnis di Indonesia.
                    </p>
                  </div>

                  {/* Quick Links */}
                  <div>
                    <h4 className="text-white font-medium text-sm mb-4">Navigasi</h4>
                    <div className="space-y-2.5">
                      {[
                        { label: "Beranda", tab: "beranda" },
                        { label: "Daftar Bot", tab: "daftar" },
                        { label: "Dashboard", tab: "dashboard" },
                      ].map((link) => (
                        <button
                          key={link.tab}
                          onClick={() => scrollToSection(link.tab)}
                          className="block text-gray-500 text-sm footer-link hover:text-wa-green"
                        >
                          {link.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <h4 className="text-white font-medium text-sm mb-4">Kontak</h4>
                    <div className="space-y-3">
                      <a
                        href="https://wa.me/6281234567890"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-gray-500 text-sm footer-link hover:text-wa-green"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        +62 812-3456-7890
                      </a>
                      <a
                        href="mailto:support@wabothub.id"
                        className="flex items-center gap-2.5 text-gray-500 text-sm footer-link hover:text-wa-green"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        support@wabothub.id
                      </a>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="text-white font-medium text-sm mb-4">Alamat</h4>
                    <div className="flex items-start gap-2.5 text-gray-500 text-sm leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>
                        Jl. Teknologi No. 42, Gedung Inovasi Lantai 5,
                        <br />
                        Jakarta Selatan, DKI Jakarta 12345
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shimmer-divider my-8" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
                  <span>&copy; 2026 WaBot Hub. Semua hak dilindungi.</span>
                  <div className="flex items-center gap-4">
                    <span className="footer-link cursor-pointer">Kebijakan Privasi</span>
                    <span className="footer-link cursor-pointer">Syarat & Ketentuan</span>
                  </div>
                </div>
              </div>
            </footer>
          </>
        )}

        {/* ═══════ DAFTAR TAB ═══════ */}
        {activeTab === "daftar" && (
          <section ref={formRef} className="py-12 md:py-20">
            <div className="max-w-xl mx-auto px-4">
              <div className="text-center mb-10 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-wa-green/20 bg-wa-green/5 text-wa-green text-xs font-medium mb-4">
                  <Bot className="w-3 h-3" />
                  Formulir Pendaftaran
                </div>
                <h2 className="text-3xl font-bold text-white">Daftarkan Bot Anda</h2>
                <p className="text-gray-400 mt-2 text-sm">
                  Isi data di bawah ini untuk mendaftarkan bot WhatsApp Anda.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="animate-fade-in-up rounded-2xl border border-dark-border bg-dark-card p-6 md:p-8 space-y-5"
                style={{ animationDelay: "0.15s" }}
              >
                {/* Nama */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Nama Lengkap <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Masukkan nama lengkap Anda"
                    className="input-glow w-full bg-[#0d0d0d] border border-dark-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 transition-all"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Nomor WhatsApp <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      name="whatsappNumber"
                      type="tel"
                      required
                      placeholder="+62 812-3456-7890"
                      className="input-glow w-full bg-[#0d0d0d] border border-dark-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-600 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Email <span className="text-gray-600">(opsional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      name="email"
                      type="email"
                      placeholder="email@contoh.com"
                      className="input-glow w-full bg-[#0d0d0d] border border-dark-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-600 transition-all"
                    />
                  </div>
                </div>

                {/* Bot Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Jenis Bot
                  </label>
                  <select
                    name="botType"
                    className="input-glow w-full bg-[#0d0d0d] border border-dark-border rounded-xl px-4 py-3 text-sm text-white appearance-none cursor-pointer transition-all"
                  >
                    {BOT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Deskripsi Bot <span className="text-gray-600">(opsional)</span>
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Jelaskan fungsi dan tujuan bot Anda..."
                    className="input-glow w-full bg-[#0d0d0d] border border-dark-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 resize-none transition-all"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 rounded-xl bg-wa-green text-dark-bg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed animate-green-glow"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Mendaftarkan...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Daftarkan Bot
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-600">
                  Dengan mendaftar, Anda menyetujui Syarat & Ketentuan kami.
                </p>
              </form>

              {/* Back link */}
              <button
                onClick={() => setActiveTab("beranda")}
                className="mt-6 mx-auto flex items-center gap-1.5 text-sm text-gray-500 hover:text-wa-green transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                Kembali ke Beranda
              </button>
            </div>
          </section>
        )}

        {/* ═══════ DASHBOARD TAB ═══════ */}
        {activeTab === "dashboard" && (
          <section className="py-12 md:py-20">
            <div className="max-w-5xl mx-auto px-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in-up">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Kelola semua pendaftaran bot WhatsApp.
                  </p>
                </div>
                <button
                  onClick={() => scrollToSection("daftar")}
                  className="btn-primary px-5 py-2.5 rounded-xl bg-wa-green text-dark-bg font-semibold text-sm flex items-center gap-2 w-fit"
                >
                  <Send className="w-4 h-4" />
                  Daftar Bot Baru
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <div className="rounded-xl border border-dark-border bg-dark-card p-4 text-center">
                  <div className="text-2xl font-bold text-white">{bots.length}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Total Bot</div>
                </div>
                <div className="rounded-xl border border-dark-border bg-dark-card p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {bots.filter((b) => b.status === "pending").length}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Menunggu</div>
                </div>
                <div className="rounded-xl border border-dark-border bg-dark-card p-4 text-center">
                  <div className="text-2xl font-bold text-wa-green">
                    {bots.filter((b) => b.status === "approved").length}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Disetujui</div>
                </div>
              </div>

              {/* Table */}
              <div className="animate-fade-in-up rounded-2xl border border-dark-border bg-dark-card overflow-hidden" style={{ animationDelay: "0.2s" }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-dark-border">
                        <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nama
                        </th>
                        <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          WhatsApp
                        </th>
                        <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                          Jenis Bot
                        </th>
                        <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-right px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bots.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-wa-green/5 border border-wa-green/10 flex items-center justify-center">
                                <Bot className="w-6 h-6 text-wa-green/40" />
                              </div>
                              <p className="text-gray-500 text-sm">Belum ada pendaftaran bot.</p>
                              <button
                                onClick={() => scrollToSection("daftar")}
                                className="text-wa-green text-sm font-medium hover:underline flex items-center gap-1"
                              >
                                Daftarkan yang pertama <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        bots.map((bot) => (
                          <tr
                            key={bot.id}
                            className="table-row-hover border-b border-dark-border last:border-0"
                          >
                            <td className="px-5 py-4">
                              <div className="font-medium text-white">{bot.name}</div>
                              <div className="text-xs text-gray-500 mt-0.5 md:hidden">
                                {bot.whatsappNumber}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-gray-400 hidden md:table-cell">
                              {bot.whatsappNumber}
                            </td>
                            <td className="px-5 py-4 hidden lg:table-cell">
                              <span className="text-gray-400 text-xs">
                                {BOT_TYPES.find((t) => t.value === bot.botType)?.label || bot.botType}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                  STATUS_MAP[bot.status]?.class || "status-pending"
                                }`}
                              >
                                {STATUS_MAP[bot.status]?.label || bot.status}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-1.5">
                                {bot.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => updateStatus(bot.id, "approved")}
                                      className="p-1.5 rounded-lg hover:bg-green-500/10 text-gray-400 hover:text-green-400 transition-colors"
                                      title="Setujui"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => updateStatus(bot.id, "rejected")}
                                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                                      title="Tolak"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                {bot.status !== "pending" && (
                                  <button
                                    onClick={() => updateStatus(bot.id, "pending")}
                                    className="p-1.5 rounded-lg hover:bg-yellow-500/10 text-gray-400 hover:text-yellow-400 transition-colors"
                                    title="Reset ke Menunggu"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteBot(bot.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Back link */}
              <button
                onClick={() => setActiveTab("beranda")}
                className="mt-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-wa-green transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                Kembali ke Beranda
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}