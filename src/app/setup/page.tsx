"use client";

import { useState, useEffect } from "react";

const SQL_EDITOR_URL = "https://supabase.com/dashboard/project/lbugditshniyphdzgjad/sql/new";
const SQL_DOWNLOAD_URL = "/api/setup.sql";

export default function SetupPage() {
  const [copied, setCopied] = useState(false);
  const [sql, setSql] = useState("");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch(SQL_DOWNLOAD_URL)
      .then((r) => r.text())
      .then(setSql);
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = sql;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 mb-2">
            <svg className="w-7 h-7 text-[#25D366]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Setup Database</h1>
          <p className="text-gray-400 text-sm">WaBot Hub perlu 2 tabel di Supabase. Ikuti 3 langkah ini:</p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-[#25D366] text-black text-sm font-bold flex items-center justify-center">1</span>
              <div className="flex-1">
                <p className="font-medium text-sm">Klik tombol <b>Copy SQL</b> di bawah ini</p>
              </div>
            </div>
          </div>

          {/* SQL + Copy Button */}
          <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
              <span className="text-xs text-gray-500 font-mono">setup-wabot-hub.sql</span>
              <button
                onClick={handleCopy}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all bg-[#25D366] text-black hover:bg-[#20bd5a] active:scale-95"
              >
                {copied ? "Copied!" : "Copy SQL"}
              </button>
            </div>
            <pre className="p-4 text-xs text-gray-300 overflow-x-auto max-h-48 overflow-y-auto font-mono leading-relaxed">
              {sql || "Loading..."}
            </pre>
          </div>

          {/* Step 2 */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-[#25D366] text-black text-sm font-bold flex items-center justify-center">2</span>
              <div className="flex-1">
                <p className="font-medium text-sm">Buka <b>SQL Editor</b> di tab baru</p>
                <a
                  href={SQL_EDITOR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  Buka SQL Editor
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-[#25D366] text-black text-sm font-bold flex items-center justify-center">3</span>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  Di SQL Editor: <b>hapus semua text</b> yang ada, lalu <b>paste</b> (tekan lama &gt; Paste), lalu klik tombol <b>Run</b> (hijau)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verify */}
        <div className="text-center space-y-3">
          <label className="flex items-center justify-center gap-2 cursor-pointer text-sm text-gray-400">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="rounded accent-[#25D366]"
            />
            Sudah selesai di-run
          </label>
          {checked && (
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-black font-semibold hover:bg-[#20bd5a] transition-all active:scale-95"
            >
              Lanjut ke WaBot Hub
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          )}
        </div>

        <p className="text-center text-xs text-gray-600">
          Kalau error, pastikan text di SQL Editor <b>kosong</b> dulu sebelum paste.
        </p>
      </div>
    </div>
  );
}