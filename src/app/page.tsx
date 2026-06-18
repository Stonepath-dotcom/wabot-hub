"use client";
// v2-supabase-migrated

import { useState, useEffect, useCallback, useRef, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Bot, MessageSquare, Zap, Shield, BarChart3, Users, Clock,
  CheckCircle2, ChevronDown, ChevronRight, Phone, Mail, MapPin,
  Send, ArrowRight, Trash2, Globe, RefreshCw, Menu, X,
  Search, Filter, Download, Settings, ExternalLink, Copy,
  LogIn, LogOut, UserPlus, Eye, Activity, TrendingUp,
  Key, Webhook, Bell, FileText, History,
} from "lucide-react";

/* ─── Types ─── */
interface BotReg {
  id: string;
  userId: string | null;
  name: string;
  whatsappNumber: string;
  email: string | null;
  botType: string;
  description: string | null;
  status: string;
  webhookUrl: string | null;
  welcomeMessage: string | null;
  autoReply: string | null;
  operatingHours: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { auditLogs: number; configs: number };
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byType: Record<string, number>;
  recentDays: Record<string, number>;
}

interface AuthUser {
  id: string;
  email: string;
  name?: string;
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
function useScrollReveal(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("scroll-visible");
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    const els = document.querySelectorAll(
      ".scroll-fade, .scroll-blur, .scroll-fade-left, .scroll-fade-right, .scroll-fade-scale"
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [active]);
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function Home() {
  const [activeTab, setActiveTab] = useState<"beranda" | "daftar" | "dashboard">("beranda");
  const [bots, setBots] = useState<BotReg[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  /* auth state */
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  /* dashboard filters */
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedBot, setSelectedBot] = useState<BotReg | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showConfig, setShowConfig] = useState<BotReg | null>(null);

  /* config form */
  const [cfgWelcome, setCfgWelcome] = useState("");
  const [cfgAutoReply, setCfgAutoReply] = useState("");
  const [cfgHours, setCfgHours] = useState("00:00 - 23:59");

  /* WA verification state */
  const [waStep, setWaStep] = useState<"idle" | "verifying" | "verified">("idle");
  const [waCode, setWaCode] = useState("");
  const [waQrDataUrl, setWaQrDataUrl] = useState("");
  const [waCodeInput, setWaCodeInput] = useState("");
  const [waPhoneInput, setWaPhoneInput] = useState("");
  const [waVerifying, setWaVerifying] = useState(false);
  const [waExpiry, setWaExpiry] = useState<number>(0);
  const waTimerRef = useRef<ReturnType<typeof setInterval>>(null);

  const formRef = useRef<HTMLDivElement>(null);

  /* ─── Runtime Supabase client (bypasses build-time env issue) ─── */
  const [sbClient, setSbClient] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/config');
        const { supabaseUrl, supabaseAnonKey } = await res.json();
        const { createClient } = await import('@supabase/supabase-js');
        setSbClient(createClient(supabaseUrl, supabaseAnonKey));
      } catch {}
    })();
  }, []);

  /* ─── Init auth ─── */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("wabot_user");
      if (stored) setUser(JSON.parse(stored));
    } catch { /* empty */ }
    setAuthInitialized(true);
  }, []);

  function saveUser(u: AuthUser | null) {
    setUser(u);
    if (u) localStorage.setItem("wabot_user", JSON.stringify(u));
    else localStorage.removeItem("wabot_user");
  }

  /* ─── Fetch bots ─── */
  const fetchBots = useCallback(async () => {
    try {
      const params = user ? `?userId=${user.id}` : "";
      const res = await fetch(`/api/bots${params}`);
      if (!res.ok) {
        let msg = `Error ${res.status}`;
        try { const j = await res.json(); msg = j.error || msg; } catch {}
        toast.error(msg);
        return;
      }
      const json = await res.json();
      if (json.data) setBots(json.data);
      if (json.stats) setStats(json.stats);
    } catch (err) {
      console.error("fetchBots error:", err);
      toast.error("Gagal memuat data bot");
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "dashboard") fetchBots();
  }, [activeTab, fetchBots]);

  /* Timer tick to force re-render for countdown display */
  const [, setTick] = useState(0);
  useEffect(() => {
    if (waStep !== "verifying") return;
    const iv = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, [waStep]);

  useScrollReveal(activeTab === "beranda");

  /* ─── Auth handlers ─── */
  async function handleAuth(e: FormEvent, mode: "login" | "register") {
    e.preventDefault();
    setAuthLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string)?.trim();
    const password = (fd.get("password") as string)?.trim();
    const name = (fd.get("name") as string)?.trim();

    if (!email || !password) {
      toast.error("Email dan password wajib diisi");
      setAuthLoading(false);
      return;
    }

    if (mode === "register" && !name) {
      toast.error("Nama wajib diisi");
      setAuthLoading(false);
      return;
    }

    /* Try Supabase first */
    try {
      const supabase = sbClient || (await import("@/lib/supabase")).supabase;
      if (supabase) {
        const result =
          mode === "register"
            ? await supabase.auth.signUp({ email, password, options: { data: { name } } })
            : await supabase.auth.signInWithPassword({ email, password });

        if (result.error) {
          toast.error(result.error.message);
          setAuthLoading(false);
          return;
        }

        const meta = result.data.user?.user_metadata;
        const authUser: AuthUser = {
          id: result.data.user!.id,
          email: result.data.user!.email!,
          name: meta?.name || email.split("@")[0],
        };
        saveUser(authUser);
        toast.success(mode === "register" ? "Registrasi berhasil! Silakan cek email untuk verifikasi." : `Selamat datang, ${authUser.name}!`);
        setAuthModal(null);
        setAuthLoading(false);
        return;
      }
    } catch { /* fall through to demo */ }

    /* Demo/local fallback */
    if (mode === "register") {
      const existing = localStorage.getItem(`wabot_acct_${email}`);
      if (existing) {
        toast.error("Email sudah terdaftar");
        setAuthLoading(false);
        return;
      }
      const acct = { id: `local_${Date.now()}`, email, name, password };
      localStorage.setItem(`wabot_acct_${email}`, JSON.stringify(acct));
      const authUser: AuthUser = { id: acct.id, email, name };
      saveUser(authUser);
      toast.success("Registrasi berhasil!");
    } else {
      const stored = localStorage.getItem(`wabot_acct_${email}`);
      if (!stored) {
        toast.error("Akun tidak ditemukan. Silakan daftar dulu.");
        setAuthLoading(false);
        return;
      }
      const acct = JSON.parse(stored);
      if (acct.password !== password) {
        toast.error("Password salah");
        setAuthLoading(false);
        return;
      }
      const authUser: AuthUser = { id: acct.id, email, name: acct.name };
      saveUser(authUser);
      toast.success(`Selamat datang, ${authUser.name}!`);
    }
    setAuthModal(null);
    setAuthLoading(false);
  }

  /* ─── Generate WA verification code ─── */
  async function startWaVerification(phone: string) {
    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    const phoneRegex = /^(\+62|62|0)[0-9]{8,13}$/;
    if (!phoneRegex.test(cleanPhone)) {
      toast.error("Format nomor WhatsApp tidak valid (contoh: +6281234567890)");
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setWaCode(code);
    setWaCodeInput("");
    setWaPhoneInput(cleanPhone);
    setWaExpiry(Date.now() + 5 * 60 * 1000); // 5 min expiry
    setWaVerifying(true);

    // Generate QR code with wa.me link
    const waMessage = encodeURIComponent(`Verifikasi WaBot Hub\nKode: ${code}`);
    const waLink = `https://wa.me/${cleanPhone.replace(/^0/, "62").replace(/^\+/, "")}?text=${waMessage}`;
    try {
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(waLink, {
        width: 220,
        margin: 1,
        color: { dark: "#25D366", light: "#0a0a0a" },
      });
      setWaQrDataUrl(dataUrl);
    } catch {
      setWaQrDataUrl("");
    }

    setWaStep("verifying");

    // Auto-expire timer
    if (waTimerRef.current) clearInterval(waTimerRef.current);
    waTimerRef.current = setInterval(() => {
      setWaExpiry((prev) => {
        if (prev - Date.now() <= 0) {
          setWaStep("idle");
          setWaVerifying(false);
          if (waTimerRef.current) clearInterval(waTimerRef.current);
          return 0;
        }
        return prev;
      });
    }, 1000);
  }

  function verifyWaCode() {
    if (waCodeInput.trim() === waCode) {
      setWaStep("verified");
      setWaVerifying(false);
      if (waTimerRef.current) clearInterval(waTimerRef.current);
      toast.success("Nomor WhatsApp berhasil diverifikasi!");
    } else {
      toast.error("Kode verifikasi salah. Coba lagi.");
    }
  }

  /* ─── Form submit ─── */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (waStep !== "verified") {
      toast.error("Verifikasi nomor WhatsApp terlebih dahulu");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const data = {
      name: (fd.get("name") as string)?.trim(),
      whatsappNumber: waPhoneInput,
      email: (fd.get("email") as string)?.trim() || null,
      botType: (fd.get("botType") as string) || "customer-service",
      description: (fd.get("description") as string)?.trim() || null,
      userId: user?.id || null,
    };
    if (!data.name || !data.whatsappNumber) { toast.error("Nama dan nomor WhatsApp wajib diisi"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        let msg = "Terjadi kesalahan";
        try { const j = await res.json(); msg = j.error || j.detail || msg; } catch {}
        toast.error(msg);
        return;
      }
      const json = await res.json();
      toast.success("Pendaftaran berhasil dikirim!");
      e.currentTarget.reset();
      setWaStep("idle");
      setWaCode("");
      setWaPhoneInput("");
      setWaQrDataUrl("");
      setActiveTab("dashboard");
    } catch (err) {
      console.error("Register error:", err);
      toast.error(err instanceof Error ? err.message : "Gagal terhubung ke server");
    }
    finally { setLoading(false); }
  }

  /* ─── Status / Delete ─── */
  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/bots/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, userId: user?.id }),
      });
      if (!res.ok) { let msg = "Gagal"; try { const j = await res.json(); msg = j.error || msg; } catch {} toast.error(msg); return; }
      toast.success(`Status: ${STATUS_MAP[status]?.label || status}`);
      fetchBots();
      if (selectedBot?.id === id) {
        setSelectedBot((prev) => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      console.error("updateStatus error:", err);
      toast.error("Gagal terhubung ke server");
    }
  }

  async function deleteBot(id: string) {
    try {
      const res = await fetch(`/api/bots/${id}/status`, { method: "DELETE" });
      if (!res.ok) { let msg = "Gagal menghapus"; try { const j = await res.json(); msg = j.error || msg; } catch {} toast.error(msg); return; }
      toast.success("Berhasil dihapus");
      fetchBots();
      if (selectedBot?.id === id) setSelectedBot(null);
    } catch (err) {
      console.error("deleteBot error:", err);
      toast.error("Gagal terhubung ke server");
    }
  }

  /* ─── Save config ─── */
  async function saveConfig() {
    if (!showConfig) return;
    try {
      const res = await fetch(`/api/bots/${showConfig.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          welcomeMessage: cfgWelcome,
          autoReply: cfgAutoReply,
          operatingHours: cfgHours,
          userId: user?.id,
        }),
      });
      if (!res.ok) { toast.error("Gagal menyimpan konfigurasi"); return; }
      toast.success("Konfigurasi disimpan!");
      fetchBots();
      setShowConfig(null);
    } catch (err) {
      console.error("saveConfig error:", err);
      toast.error("Gagal terhubung ke server");
    }
  }

  /* ─── Generate webhook ─── */
  async function generateWebhook(id: string) {
    const webhookId = `wh_${id.slice(0, 8)}`;
    const url = `${window.location.origin}/api/webhook/${webhookId}`;
    try {
      const res = await fetch(`/api/bots/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: url, userId: user?.id }),
      });
      if (!res.ok) { toast.error("Gagal generate webhook"); return; }
      toast.success("Webhook URL dibuat!");
      fetchBots();
      if (selectedBot?.id === id) setSelectedBot((p) => p ? { ...p, webhookUrl: url } : null);
    } catch (err) {
      console.error("generateWebhook error:", err);
      toast.error("Gagal terhubung ke server");
    }
  }

  /* ─── Export CSV ─── */
  function exportCSV() {
    const filtered = getFilteredBots();
    const headers = ["Nama", "WhatsApp", "Email", "Jenis Bot", "Status", "Webhook", "Tanggal Daftar"];
    const rows = filtered.map((b) => [
      b.name, b.whatsappNumber, b.email || "", BOT_TYPES.find((t) => t.value === b.botType)?.label || b.botType,
      STATUS_MAP[b.status]?.label || b.status, b.webhookUrl || "-", new Date(b.createdAt).toLocaleDateString("id-ID"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `wabot-exports-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success("File CSV berhasil diunduh");
  }

  /* ─── Copy webhook ─── */
  function copyWebhook(url: string) {
    navigator.clipboard.writeText(url);
    toast.success("Webhook URL disalin!");
  }

  /* ─── Helpers ─── */
  function getFilteredBots() {
    return bots.filter((b) => {
      const matchSearch =
        !searchQuery ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.whatsappNumber.includes(searchQuery);
      const matchStatus = filterStatus === "all" || b.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }

  function scrollToSection(tab: string) {
    setActiveTab(tab as typeof activeTab);
    setMobileMenu(false);
    if (tab === "daftar") {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }

  function openConfig(bot: BotReg) {
    setShowConfig(bot);
    setCfgWelcome(bot.welcomeMessage || "");
    setCfgAutoReply(bot.autoReply || "");
    setCfgHours(bot.operatingHours || "00:00 - 23:59");
  }

  /* ═══════════════════════════════════════
     RENDER
     ═══════════════════════════════════════ */
  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── AUTH MODAL ─── */}
      {authModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAuthModal(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-dark-border bg-dark-card p-6 md:p-8 animate-fade-in-up">
            <button onClick={() => setAuthModal(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-gray-400">
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-wa-green/10 border border-wa-green/20 flex items-center justify-center">
                {authModal === "login" ? <LogIn className="w-4 h-4 text-wa-green" /> : <UserPlus className="w-4 h-4 text-wa-green" />}
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  {authModal === "login" ? "Masuk" : "Daftar Akun"}
                </h3>
                <p className="text-xs text-gray-500">
                  {authModal === "login" ? "Masuk untuk mengelola bot Anda" : "Buat akun baru di WaBot Hub"}
                </p>
              </div>
            </div>

            <form onSubmit={(e) => handleAuth(e, authModal)} className="space-y-4">
              {authModal === "register" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Nama Lengkap</label>
                  <input name="name" type="text" required placeholder="Nama Anda"
                    className="input-glow w-full bg-[#0d0d0d] border border-dark-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 transition-all" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input name="email" type="email" required placeholder="email@contoh.com"
                    className="input-glow w-full bg-[#0d0d0d] border border-dark-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-600 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input name="password" type="password" required placeholder="Min. 6 karakter" minLength={6}
                    className="input-glow w-full bg-[#0d0d0d] border border-dark-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-600 transition-all" />
                </div>
              </div>

              <button type="submit" disabled={authLoading}
                className="btn-primary w-full py-3 rounded-xl bg-wa-green text-dark-bg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {authLoading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Memproses...</> :
                  authModal === "login" ? <><LogIn className="w-4 h-4" /> Masuk</> : <><UserPlus className="w-4 h-4" /> Daftar</>}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-gray-500">
              {authModal === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <button onClick={() => setAuthModal(authModal === "login" ? "register" : "login")}
                className="text-wa-green hover:underline font-medium">
                {authModal === "login" ? "Daftar" : "Masuk"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── BOT DETAIL SLIDE-OVER ─── */}
      {selectedBot && (
        <div className="fixed inset-0 z-[90] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedBot(null)} />
          <div className="relative w-full max-w-lg bg-dark-card border-l border-dark-border overflow-y-auto custom-scroll animate-fade-in-right">
            <div className="sticky top-0 z-10 bg-dark-card/95 backdrop-blur-sm border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-wa-green" /> Detail Bot
              </h3>
              <button onClick={() => setSelectedBot(null)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xl font-bold text-white">{selectedBot.name}</h4>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_MAP[selectedBot.status]?.class || "status-pending"}`}>
                    {STATUS_MAP[selectedBot.status]?.label || selectedBot.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{selectedBot.description || "Tidak ada deskripsi"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Phone, label: "WhatsApp", value: selectedBot.whatsappNumber },
                  { icon: Mail, label: "Email", value: selectedBot.email || "-" },
                  { icon: Bot, label: "Jenis", value: BOT_TYPES.find((t) => t.value === selectedBot.botType)?.label || selectedBot.botType },
                  { icon: Clock, label: "Terdaftar", value: new Date(selectedBot.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-[#0d0d0d] border border-dark-border p-3">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                      <item.icon className="w-3 h-3" /> {item.label}
                    </div>
                    <div className="text-white text-sm font-medium truncate">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Webhook */}
              <div className="rounded-xl bg-[#0d0d0d] border border-dark-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Webhook className="w-4 h-4 text-wa-green" /> Webhook URL
                  </div>
                  {selectedBot.status === "approved" && (
                    <button onClick={() => generateWebhook(selectedBot.id)}
                      className="text-xs text-wa-green hover:underline flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Generate
                    </button>
                  )}
                </div>
                {selectedBot.webhookUrl ? (
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs text-gray-400 bg-dark-bg rounded-lg px-3 py-2 truncate block">
                      {selectedBot.webhookUrl}
                    </code>
                    <button onClick={() => copyWebhook(selectedBot.webhookUrl!)}
                      className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-wa-green transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600">
                    {selectedBot.status === "approved" ? "Klik Generate untuk membuat webhook URL" : "Webhook tersedia setelah bot disetujui"}
                  </p>
                )}
              </div>

              {/* Config buttons */}
              <div className="flex gap-2">
                <button onClick={() => openConfig(selectedBot)}
                  className="flex-1 btn-outline py-2.5 rounded-xl border border-dark-border-hover text-sm font-medium flex items-center justify-center gap-2 text-white">
                  <Settings className="w-4 h-4" /> Konfigurasi
                </button>
                <button onClick={() => { setSelectedBot(null); setActiveTab("dashboard"); }}
                  className="flex-1 btn-outline py-2.5 rounded-xl border border-dark-border-hover text-sm font-medium flex items-center justify-center gap-2 text-white">
                  <History className="w-4 h-4" /> Riwayat
                </button>
              </div>

              {/* Status Actions */}
              <div className="border-t border-dark-border pt-4">
                <h5 className="text-sm font-medium text-gray-300 mb-3">Ubah Status</h5>
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(selectedBot.id, "approved")}
                    className="flex-1 py-2 rounded-xl text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors">
                    Setujui
                  </button>
                  <button onClick={() => updateStatus(selectedBot.id, "rejected")}
                    className="flex-1 py-2 rounded-xl text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                    Tolak
                  </button>
                  <button onClick={() => updateStatus(selectedBot.id, "pending")}
                    className="flex-1 py-2 rounded-xl text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors">
                    Reset
                  </button>
                </div>
              </div>

              {/* Delete */}
              <button onClick={() => { deleteBot(selectedBot.id); setSelectedBot(null); }}
                className="w-full py-2.5 rounded-xl text-xs font-medium bg-red-500/5 text-red-400 border border-red-500/10 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2">
                <Trash2 className="w-3.5 h-3.5" /> Hapus Bot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CONFIG MODAL ─── */}
      {showConfig && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowConfig(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-dark-border bg-dark-card p-6 md:p-8 animate-fade-in-up">
            <button onClick={() => setShowConfig(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-gray-400">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-wa-green/10 border border-wa-green/20 flex items-center justify-center">
                <Settings className="w-4 h-4 text-wa-green" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Konfigurasi Bot</h3>
                <p className="text-xs text-gray-500">{showConfig.name}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Pesan Sambutan</label>
                <textarea rows={3} value={cfgWelcome} onChange={(e) => setCfgWelcome(e.target.value)}
                  placeholder="Halo! Ada yang bisa saya bantu?"
                  className="input-glow w-full bg-[#0d0d0d] border border-dark-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 resize-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Auto Reply</label>
                <textarea rows={3} value={cfgAutoReply} onChange={(e) => setCfgAutoReply(e.target.value)}
                  placeholder="Terima kasih telah menghubungi kami. Kami akan segera membalas pesan Anda."
                  className="input-glow w-full bg-[#0d0d0d] border border-dark-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 resize-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Jam Operasional</label>
                <input value={cfgHours} onChange={(e) => setCfgHours(e.target.value)}
                  placeholder="00:00 - 23:59"
                  className="input-glow w-full bg-[#0d0d0d] border border-dark-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 transition-all" />
              </div>
              <button onClick={saveConfig}
                className="btn-primary w-full py-3 rounded-xl bg-wa-green text-dark-bg font-semibold text-sm">
                Simpan Konfigurasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          NAVBAR
          ═══════════════════════════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 nav-blur border-b border-dark-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveTab("beranda"); setMobileMenu(false); }}>
            <div className="w-8 h-8 rounded-lg bg-wa-green/10 border border-wa-green/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-wa-green" />
            </div>
            <span className="font-semibold text-white tracking-tight">WaBot Hub</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {(["beranda", "daftar", "dashboard"] as const).map((tab) => (
              <button key={tab} onClick={() => scrollToSection(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab ? "bg-wa-green/10 text-wa-green" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}>
                {tab === "beranda" ? "Beranda" : tab === "daftar" ? "Daftar Bot" : "Dashboard"}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 rounded-full bg-wa-green/10 border border-wa-green/20 flex items-center justify-center">
                    <span className="text-wa-green text-xs font-bold">{user.name?.[0]?.toUpperCase() || "U"}</span>
                  </div>
                  <span className="text-gray-300 text-sm max-w-[100px] truncate">{user.name || user.email}</span>
                </div>
                <button onClick={() => { saveUser(null); toast.success("Berhasil keluar"); }}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors" title="Keluar">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setAuthModal("login")}
                className="btn-primary px-4 py-2 rounded-xl bg-wa-green text-dark-bg font-semibold text-xs flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" /> Masuk
              </button>
            )}
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors">
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t border-dark-border bg-[#0a0a0a]/95 backdrop-blur-sm px-4 py-3 space-y-1">
            {(["beranda", "daftar", "dashboard"] as const).map((tab) => (
              <button key={tab} onClick={() => scrollToSection(tab)}
                className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab ? "bg-wa-green/10 text-wa-green" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}>
                {tab === "beranda" ? "Beranda" : tab === "daftar" ? "Daftar Bot" : "Dashboard"}
              </button>
            ))}
            <div className="border-t border-dark-border pt-2 mt-1">
              {user ? (
                <button onClick={() => { saveUser(null); setMobileMenu(false); toast.success("Berhasil keluar"); }}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Keluar ({user.name || user.email})
                </button>
              ) : (
                <button onClick={() => { setMobileMenu(false); setAuthModal("login"); }}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-wa-green hover:bg-wa-green/5 flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Masuk / Daftar
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 pt-14">
        {/* ═══════════════════════════════
            BERANDA
            ═══════════════════════════════ */}
        {activeTab === "beranda" && (
          <>
            {/* HERO */}
            <section className="relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-wa-green/8 blur-[120px] animate-glow-drift pointer-events-none" />
              <div className="absolute top-20 right-10 w-2 h-2 rounded-full bg-wa-green animate-pulse-dot pointer-events-none" />
              <div className="absolute top-40 left-20 w-1.5 h-1.5 rounded-full bg-wa-green/60 animate-pulse-dot pointer-events-none" style={{ animationDelay: "0.7s" }} />

              <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center relative">
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
                    <button onClick={() => scrollToSection("daftar")}
                      className="btn-primary px-6 py-3 rounded-xl bg-wa-green text-dark-bg font-semibold text-sm flex items-center gap-2 animate-green-glow">
                      Daftarkan Bot <ArrowRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => scrollToSection("dashboard")}
                      className="btn-outline px-6 py-3 rounded-xl border border-dark-border-hover text-white font-medium text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" /> Lihat Dashboard
                    </button>
                  </div>
                </div>

                <div className="animate-fade-in-right hidden md:flex justify-center">
                  <div className="animate-float w-full max-w-sm">
                    <div className="rounded-2xl border border-dark-border-hover bg-dark-card overflow-hidden shadow-2xl shadow-black/40">
                      <div className="px-4 py-3 bg-wa-green-dark flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
                        <div>
                          <div className="text-white text-sm font-medium">WaBot Assistant</div>
                          <div className="text-white/60 text-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-300" /> Online
                          </div>
                        </div>
                      </div>
                      <div className="p-4 space-y-3 min-h-[260px] bg-[#0d1117]">
                        <div className="flex gap-2 animate-chat-bounce" style={{ animationDelay: "0.2s" }}>
                          <div className="w-6 h-6 rounded-full bg-wa-green/20 flex items-center justify-center shrink-0 mt-1"><Bot className="w-3 h-3 text-wa-green" /></div>
                          <div className="bg-[#1a2332] rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[75%]">
                            <p className="text-sm text-gray-200">Halo! Saya bot WhatsApp Anda. Ada yang bisa saya bantu?</p>
                            <span className="text-[10px] text-gray-500 mt-1 block">10:42</span>
                          </div>
                        </div>
                        <div className="flex justify-end animate-chat-bounce" style={{ animationDelay: "0.8s" }}>
                          <div className="bg-wa-green-dark rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[75%]">
                            <p className="text-sm text-white">Saya ingin cek status pesanan saya</p>
                            <span className="text-[10px] text-white/50 mt-1 block text-right">10:42</span>
                          </div>
                        </div>
                        <div className="flex gap-2 animate-chat-bounce" style={{ animationDelay: "1.5s" }}>
                          <div className="w-6 h-6 rounded-full bg-wa-green/20 flex items-center justify-center shrink-0 mt-1"><Bot className="w-3 h-3 text-wa-green" /></div>
                          <div className="bg-[#1a2332] rounded-2xl rounded-tl-sm px-4 py-3">
                            <div className="flex gap-1.5">
                              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 bg-[#0d1117] border-t border-dark-border flex items-center gap-2">
                        <div className="flex-1 bg-[#1a2332] rounded-full px-4 py-2 text-xs text-gray-500">Ketik pesan...</div>
                        <div className="w-8 h-8 rounded-full bg-wa-green flex items-center justify-center"><Send className="w-3.5 h-3.5 text-white" /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* STATS */}
            <section className="border-y border-dark-border">
              <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { value: "500+", label: "Bot Terdaftar", icon: Bot },
                  { value: "99.9%", label: "Uptime Server", icon: Shield },
                  { value: "24/7", label: "Support Aktif", icon: Clock },
                  { value: "1.2M+", label: "Pesan / Bulan", icon: MessageSquare },
                ].map((stat, i) => (
                  <div key={stat.label} className="scroll-fade flex items-center gap-3 justify-center md:justify-start" style={{ transitionDelay: `${i * 100}ms` }}>
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

            {/* FEATURES */}
            <section className="py-20 md:py-24">
              <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-14 scroll-fade">
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Kenapa Pilih <span className="text-wa-green">WaBot Hub</span>?
                  </h2>
                  <p className="text-gray-400 mt-3 max-w-lg mx-auto">Platform terlengkap untuk mengelola bot WhatsApp bisnis Anda.</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: MessageSquare, title: "Auto Reply Cerdas", desc: "Balas pesan masuk secara otomatis dengan template yang bisa dikustomisasi sesuai kebutuhan bisnis Anda." },
                    { icon: Users, title: "Multi-User Management", desc: "Kelola banyak bot dalam satu dashboard. Cocok untuk agensi atau bisnis dengan beberapa cabang." },
                    { icon: BarChart3, title: "Analitik Real-time", desc: "Pantau performa bot Anda dengan dashboard analitik yang menampilkan statistik pesan dan respons." },
                    { icon: Zap, title: "Setup Instan", desc: "Daftar dan konfigurasi bot dalam hitungan menit. Tanpa instalasi rumit, langsung siap pakai." },
                    { icon: Shield, title: "Keamanan Terjamin", desc: "Enkripsi end-to-end dan autentikasi two-factor untuk melindungi data bisnis Anda." },
                    { icon: Globe, title: "API & Webhook", desc: "Integrasikan bot WhatsApp Anda dengan sistem CRM, e-commerce, atau tools lainnya via REST API dan webhook." },
                  ].map((feat, i) => (
                    <div key={feat.title} className="scroll-fade card-hover group rounded-2xl border border-dark-border bg-dark-card p-6" style={{ transitionDelay: `${i * 80}ms` }}>
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

            {/* HOW IT WORKS */}
            <section className="py-20 md:py-24">
              <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-14 scroll-fade">
                  <h2 className="text-3xl md:text-4xl font-bold text-white">Cara Kerja</h2>
                  <p className="text-gray-400 mt-3 max-w-md mx-auto">Tiga langkah mudah untuk mulai menggunakan bot WhatsApp Anda.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { step: "01", icon: Send, title: "Daftarkan Bot", desc: "Isi formulir pendaftaran dengan informasi bot dan nomor WhatsApp bisnis Anda. Proses cepat tanpa biaya." },
                    { step: "02", icon: RefreshCw, title: "Konfigurasi", desc: "Atur pesan balasan otomatis, buat menu interaktif, dan sesuaikan perilaku bot sesuai kebutuhan." },
                    { step: "03", icon: CheckCircle2, title: "Bot Aktif!", desc: "Setelah disetujui, bot Anda langsung aktif dan mulai melayani pelanggan 24 jam non-stop." },
                  ].map((item, i) => (
                    <div key={item.step} className={`scroll-fade-${i === 0 ? "left" : i === 2 ? "right" : "scale"} relative`} style={{ transitionDelay: `${i * 120}ms` }}>
                      <div className="card-hover rounded-2xl border border-dark-border bg-dark-card p-6 text-center h-full">
                        <div className="text-5xl font-black text-wa-green/10 absolute top-4 right-6">{item.step}</div>
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

            {/* FAQ */}
            <section className="py-20 border-t border-dark-border">
              <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-12 scroll-fade"><h2 className="text-3xl md:text-4xl font-bold text-white">Pertanyaan Umum</h2></div>
                <div className="space-y-3">
                  {[
                    { q: "Apakah pendaftaran bot gratis?", a: "Ya, pendaftaran bot di WaBot Hub sepenuhnya gratis. Anda hanya perlu mengisi formulir dan menunggu persetujuan dari tim kami." },
                    { q: "Berapa lama proses persetujuan?", a: "Proses review dan persetujuan biasanya memakan waktu 1x24 jam kerja. Untuk permintaan dengan volume tinggi, bisa memakan waktu hingga 3 hari kerja." },
                    { q: "Jenis bot apa saja yang didukung?", a: "Kami mendukung customer service otomatis, marketing & promo, transaksi & pembayaran, notifikasi & reminder, serta AI chatbot." },
                    { q: "Apakah data saya aman?", a: "Keamanan data adalah prioritas utama kami. Semua data dienkripsi dan disimpan di server yang aman. Kami tidak pernah membagikan informasi pribadi Anda." },
                    { q: "Bisa integrasi dengan sistem yang sudah ada?", a: "Ya! WaBot Hub menyediakan REST API dan Webhook yang bisa diintegrasikan dengan CRM, e-commerce, atau sistem internal perusahaan Anda." },
                  ].map((faq, i) => (
                    <details key={i} className="scroll-fade faq-hover group rounded-xl border border-dark-border bg-dark-card overflow-hidden" style={{ transitionDelay: `${i * 60}ms` }}>
                      <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium text-sm list-none">
                        {faq.q}
                        <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform duration-300" />
                      </summary>
                      <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed border-t border-dark-border pt-3">{faq.a}</div>
                    </details>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="py-20">
              <div className="max-w-6xl mx-auto px-4">
                <div className="scroll-fade-scale relative rounded-3xl border border-wa-green/10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-wa-green-dark/20 via-dark-bg to-dark-bg" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-wa-green/5 blur-[100px] animate-glow-pulse pointer-events-none" />
                  <div className="relative px-6 py-16 md:py-20 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Siap Membuat Bot WhatsApp Anda?</h2>
                    <p className="text-gray-400 max-w-md mx-auto mb-8">Bergabung dengan ratusan bisnis yang sudah menggunakan WaBot Hub untuk otomasi WhatsApp mereka.</p>
                    <button onClick={() => scrollToSection("daftar")}
                      className="btn-primary px-8 py-3.5 rounded-xl bg-wa-green text-dark-bg font-semibold text-sm animate-green-glow inline-flex items-center gap-2">
                      Daftar Sekarang — Gratis <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-dark-border bg-[#070707]">
              <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
                  <div className="sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-wa-green/10 border border-wa-green/20 flex items-center justify-center"><Bot className="w-4 h-4 text-wa-green" /></div>
                      <span className="font-semibold text-white">WaBot Hub</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs">Platform pendaftaran dan pengelolaan bot WhatsApp terpercaya untuk bisnis di Indonesia.</p>
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm mb-4">Navigasi</h4>
                    <div className="space-y-2.5">
                      {[{ label: "Beranda", tab: "beranda" }, { label: "Daftar Bot", tab: "daftar" }, { label: "Dashboard", tab: "dashboard" }].map((link) => (
                        <button key={link.tab} onClick={() => scrollToSection(link.tab)} className="block text-gray-500 text-sm footer-link hover:text-wa-green">{link.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm mb-4">Kontak</h4>
                    <div className="space-y-3">
                      <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-gray-500 text-sm footer-link hover:text-wa-green">
                        <Phone className="w-3.5 h-3.5" /> +62 812-3456-7890
                      </a>
                      <a href="mailto:support@wabothub.id" className="flex items-center gap-2.5 text-gray-500 text-sm footer-link hover:text-wa-green">
                        <Mail className="w-3.5 h-3.5" /> support@wabothub.id
                      </a>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm mb-4">Alamat</h4>
                    <div className="flex items-start gap-2.5 text-gray-500 text-sm leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>Jl. Teknologi No. 42, Gedung Inovasi Lantai 5,<br />Jakarta Selatan, DKI Jakarta 12345</span>
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

        {/* ═══════════════════════════════
            DAFTAR TAB
            ═══════════════════════════════ */}
        {activeTab === "daftar" && (
          <section ref={formRef} className="py-12 md:py-20">
            <div className="max-w-xl mx-auto px-4">

              {/* ── LOGIN GATE ── */}
              {!user ? (
                <div className="animate-fade-in-up text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-wa-green/10 border border-wa-green/20 flex items-center justify-center">
                    <LogIn className="w-8 h-8 text-wa-green" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Login Diperlukan</h2>
                  <p className="text-gray-400 text-sm max-w-sm mx-auto mb-8">
                    Anda harus login terlebih dahulu sebelum mendaftarkan bot WhatsApp. Ini untuk keamanan dan pengelolaan bot Anda.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => setAuthModal("login")}
                      className="btn-primary px-6 py-3 rounded-xl bg-wa-green text-dark-bg font-semibold text-sm flex items-center gap-2 animate-green-glow">
                      <LogIn className="w-4 h-4" /> Masuk
                    </button>
                    <button onClick={() => setAuthModal("register")}
                      className="btn-outline px-6 py-3 rounded-xl border border-dark-border-hover text-white font-medium text-sm flex items-center gap-2 hover:border-wa-green/30 hover:text-wa-green">
                      <UserPlus className="w-4 h-4" /> Daftar Akun Baru
                    </button>
                  </div>
                  <button onClick={() => setActiveTab("beranda")}
                    className="mt-8 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-wa-green transition-colors">
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Kembali ke Beranda
                  </button>
                </div>
              ) : (
              <>
              {/* ── REGISTER FORM (logged in) ── */}
              <div className="text-center mb-10 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-wa-green/20 bg-wa-green/5 text-wa-green text-xs font-medium mb-4">
                  <Bot className="w-3 h-3" /> Formulir Pendaftaran
                </div>
                <h2 className="text-3xl font-bold text-white">Daftarkan Bot Anda</h2>
                <p className="text-gray-400 mt-2 text-sm">
                  Login sebagai <span className="text-wa-green font-medium">{user.name || user.email}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit}
                className="animate-fade-in-up rounded-2xl border border-dark-border bg-dark-card p-6 md:p-8 space-y-5" style={{ animationDelay: "0.15s" }}>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Nama Bot <span className="text-red-400">*</span></label>
                  <input name="name" type="text" required placeholder="Nama bot Anda (contoh: CS Toko Jaya)"
                    className="input-glow w-full bg-[#0d0d0d] border border-dark-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 transition-all" />
                </div>

                {/* ── WHATSAPP VERIFICATION ── */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Nomor WhatsApp <span className="text-red-400">*</span></label>
                  {waStep === "idle" && (
                    <div className="space-y-3">
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input id="wa-phone-input" type="tel" placeholder="+62 812-3456-7890"
                          value={waPhoneInput}
                          onChange={(e) => setWaPhoneInput(e.target.value)}
                          className="input-glow w-full bg-[#0d0d0d] border border-dark-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-600 transition-all" />
                      </div>
                      <button type="button" onClick={() => startWaVerification(waPhoneInput)} disabled={waVerifying || !waPhoneInput}
                        className="w-full py-2.5 rounded-xl border border-wa-green/30 bg-wa-green/5 text-wa-green text-sm font-medium flex items-center justify-center gap-2 hover:bg-wa-green/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                        <MessageSquare className="w-4 h-4" /> Verifikasi via WhatsApp
                      </button>
                    </div>
                  )}

                  {waStep === "verifying" && (
                    <div className="space-y-4 p-4 rounded-xl border border-wa-green/20 bg-wa-green/5">
                      <div className="text-center">
                        <p className="text-sm text-gray-300 mb-1">Scan QR Code atau klik tombol di bawah</p>
                        <p className="text-xs text-gray-500">Buka WhatsApp, kirim pesan verifikasi ke nomor <span className="text-wa-green font-medium">{waPhoneInput}</span></p>
                      </div>

                      {/* QR Code */}
                      {waQrDataUrl && (
                        <div className="flex justify-center">
                          <div className="p-3 rounded-xl bg-white">
                            <img src={waQrDataUrl} alt="QR Code WhatsApp" className="w-52 h-52" />
                          </div>
                        </div>
                      )}

                      {/* Timer */}
                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          Kode berlaku {Math.max(0, Math.ceil((waExpiry - Date.now()) / 1000))} detik lagi
                        </p>
                      </div>

                      {/* Open WhatsApp button */}
                      {(() => {
                        const cleanForLink = waPhoneInput.replace(/^0/, "62").replace(/^\+/, "");
                        const waMsg = encodeURIComponent(`Verifikasi WaBot Hub\nKode: ${waCode}`);
                        return (
                          <a href={`https://wa.me/${cleanForLink}?text=${waMsg}`} target="_blank" rel="noopener"
                            className="w-full py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-all">
                            <MessageSquare className="w-4 h-4" /> Buka WhatsApp
                          </a>
                        );
                      })()}

                      {/* Code input */}
                      <div className="space-y-2">
                        <label className="block text-xs text-gray-400 text-center">Masukkan 6-digit kode verifikasi</label>
                        <div className="flex gap-2">
                          <input type="text" maxLength={6} placeholder="000000"
                            value={waCodeInput}
                            onChange={(e) => setWaCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            className="input-glow flex-1 bg-[#0d0d0d] border border-dark-border rounded-xl px-4 py-2.5 text-center text-lg tracking-[0.3em] font-mono text-white placeholder:text-gray-600 transition-all" />
                          <button type="button" onClick={verifyWaCode} disabled={waCodeInput.length !== 6}
                            className="px-5 rounded-xl bg-wa-green text-dark-bg font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                            Verifikasi
                          </button>
                        </div>
                      </div>

                      <button type="button" onClick={() => { setWaStep("idle"); setWaVerifying(false); if (waTimerRef.current) clearInterval(waTimerRef.current); }}
                        className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors py-1">
                        Batal & pakai nomor lain
                      </button>
                    </div>
                  )}

                  {waStep === "verified" && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-green-500/20 bg-green-500/5">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-green-300 text-sm font-medium">Terverifikasi</p>
                        <p className="text-gray-500 text-xs truncate">{waPhoneInput}</p>
                      </div>
                      <button type="button" onClick={() => { setWaStep("idle"); setWaCode(""); setWaPhoneInput(""); setWaQrDataUrl(""); }}
                        className="text-xs text-gray-500 hover:text-gray-300 shrink-0">Ubah</button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email <span className="text-gray-600">(opsional)</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input name="email" type="email" placeholder="email@contoh.com"
                      className="input-glow w-full bg-[#0d0d0d] border border-dark-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-600 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Jenis Bot</label>
                  <select name="botType"
                    className="input-glow w-full bg-[#0d0d0d] border border-dark-border rounded-xl px-4 py-3 text-sm text-white appearance-none cursor-pointer transition-all">
                    {BOT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Deskripsi Bot <span className="text-gray-600">(opsional)</span></label>
                  <textarea name="description" rows={3} placeholder="Jelaskan fungsi dan tujuan bot Anda..."
                    className="input-glow w-full bg-[#0d0d0d] border border-dark-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 resize-none transition-all" />
                </div>
                <button type="submit" disabled={loading || waStep !== "verified"}
                  className="btn-primary w-full py-3.5 rounded-xl bg-wa-green text-dark-bg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed animate-green-glow">
                  {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Mendaftarkan...</> : waStep !== "verified" ? <><Shield className="w-4 h-4" /> Verifikasi WhatsApp Terlebih Dahulu</> : <><Send className="w-4 h-4" /> Daftarkan Bot</>}
                </button>
                <p className="text-center text-xs text-gray-600">Dengan mendaftar, Anda menyetujui Syarat & Ketentuan kami.</p>
              </form>

              <button onClick={() => setActiveTab("beranda")}
                className="mt-6 mx-auto flex items-center gap-1.5 text-sm text-gray-500 hover:text-wa-green transition-colors">
                <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Kembali ke Beranda
              </button>
              </>
              )}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════
            DASHBOARD TAB
            ═══════════════════════════════ */}
        {activeTab === "dashboard" && (
          <section className="py-12 md:py-20">
            <div className="max-w-6xl mx-auto px-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in-up">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {user ? `Halo, ${user.name || user.email}` : "Kelola semua pendaftaran bot WhatsApp."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowAnalytics(!showAnalytics)}
                    className={`btn-outline px-4 py-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${showAnalytics ? "border-wa-green/30 text-wa-green bg-wa-green/5" : "border-dark-border-hover text-white"}`}>
                    <Activity className="w-3.5 h-3.5" /> Analitik
                  </button>
                  <button onClick={exportCSV}
                    className="btn-outline px-4 py-2.5 rounded-xl border border-dark-border-hover text-white text-xs font-medium flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                  <button onClick={() => scrollToSection("daftar")}
                    className="btn-primary px-4 py-2.5 rounded-xl bg-wa-green text-dark-bg font-semibold text-xs flex items-center gap-2">
                    <Send className="w-3.5 h-3.5" /> Daftar Bot
                  </button>
                </div>
              </div>

              {/* Analytics Panel */}
              {showAnalytics && stats && (
                <div className="mb-8 animate-fade-in-up grid sm:grid-cols-2 gap-4">
                  {/* By Type Chart */}
                  <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
                    <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-4">
                      <BarChart3 className="w-4 h-4 text-wa-green" /> Distribusi Jenis Bot
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(stats.byType).map(([type, count]) => {
                        const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        const label = BOT_TYPES.find((t) => t.value === type)?.label || type;
                        return (
                          <div key={type}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">{label}</span>
                              <span className="text-gray-300 font-medium">{count} ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-wa-green-dark to-wa-green rounded-full transition-all duration-700"
                                style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                      {Object.keys(stats.byType).length === 0 && (
                        <p className="text-gray-600 text-xs text-center py-4">Belum ada data</p>
                      )}
                    </div>
                  </div>

                  {/* Status Distribution */}
                  <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
                    <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-4">
                      <TrendingUp className="w-4 h-4 text-wa-green" /> Ringkasan Status
                    </h4>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="text-center p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                        <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                        <div className="text-[10px] text-yellow-400/60 mt-0.5">Menunggu</div>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                        <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
                        <div className="text-[10px] text-green-400/60 mt-0.5">Disetujui</div>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                        <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
                        <div className="text-[10px] text-red-400/60 mt-0.5">Ditolak</div>
                      </div>
                    </div>

                    {/* Approval Rate */}
                    <div className="rounded-xl bg-[#0d0d0d] border border-dark-border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Approval Rate</span>
                        <span className="text-sm font-bold text-wa-green">
                          {stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                      <div className="h-3 bg-dark-bg rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-wa-green-dark to-wa-green rounded-full transition-all duration-700"
                          style={{ width: `${stats.total > 0 ? (stats.approved / stats.total) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <div className="rounded-xl border border-dark-border bg-dark-card p-4 text-center">
                  <div className="text-2xl font-bold text-white">{bots.length}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Total Bot</div>
                </div>
                <div className="rounded-xl border border-dark-border bg-dark-card p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{bots.filter((b) => b.status === "pending").length}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Menunggu</div>
                </div>
                <div className="rounded-xl border border-dark-border bg-dark-card p-4 text-center">
                  <div className="text-2xl font-bold text-wa-green">{bots.filter((b) => b.status === "approved").length}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Disetujui</div>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama atau nomor WhatsApp..."
                    className="input-glow w-full bg-[#0d0d0d] border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 transition-all" />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="input-glow bg-[#0d0d0d] border border-dark-border rounded-xl pl-10 pr-8 py-2.5 text-sm text-white appearance-none cursor-pointer transition-all">
                    <option value="all">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="approved">Disetujui</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="animate-fade-in-up rounded-2xl border border-dark-border bg-dark-card overflow-hidden" style={{ animationDelay: "0.2s" }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-dark-border">
                        <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                        <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">WhatsApp</th>
                        <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Jenis</th>
                        <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Webhook</th>
                        <th className="text-right px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredBots().length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-wa-green/5 border border-wa-green/10 flex items-center justify-center">
                                <Bot className="w-6 h-6 text-wa-green/40" />
                              </div>
                              <p className="text-gray-500 text-sm">
                                {searchQuery || filterStatus !== "all" ? "Tidak ada bot yang cocok dengan filter." : "Belum ada pendaftaran bot."}
                              </p>
                              <button onClick={() => scrollToSection("daftar")} className="text-wa-green text-sm font-medium hover:underline flex items-center gap-1">
                                Daftarkan yang pertama <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        getFilteredBots().map((bot) => (
                          <tr key={bot.id} className="table-row-hover border-b border-dark-border last:border-0">
                            <td className="px-5 py-4">
                              <button onClick={() => setSelectedBot(bot)} className="text-left group">
                                <div className="font-medium text-white group-hover:text-wa-green transition-colors">{bot.name}</div>
                                <div className="text-xs text-gray-500 mt-0.5 md:hidden">{bot.whatsappNumber}</div>
                              </button>
                            </td>
                            <td className="px-5 py-4 text-gray-400 hidden md:table-cell">{bot.whatsappNumber}</td>
                            <td className="px-5 py-4 hidden lg:table-cell">
                              <span className="text-gray-400 text-xs">{BOT_TYPES.find((t) => t.value === bot.botType)?.label || bot.botType}</span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_MAP[bot.status]?.class || "status-pending"}`}>
                                {STATUS_MAP[bot.status]?.label || bot.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 hidden xl:table-cell">
                              {bot.webhookUrl ? (
                                <button onClick={() => copyWebhook(bot.webhookUrl!)} className="text-wa-green text-xs hover:underline flex items-center gap-1">
                                  <Copy className="w-3 h-3" /> Salin
                                </button>
                              ) : (
                                <span className="text-gray-600 text-xs">-</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => setSelectedBot(bot)} className="p-1.5 rounded-lg hover:bg-wa-green/10 text-gray-400 hover:text-wa-green transition-colors" title="Detail">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button onClick={() => openConfig(bot)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="Konfigurasi">
                                  <Settings className="w-4 h-4" />
                                </button>
                                <button onClick={() => deleteBot(bot.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors" title="Hapus">
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

              <button onClick={() => setActiveTab("beranda")}
                className="mt-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-wa-green transition-colors">
                <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Kembali ke Beranda
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}