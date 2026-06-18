"use client";

import { useState, useEffect } from "react";

const SQL_EDITOR_URL = "https://supabase.com/dashboard/project/lbugditshniyphdzgjad/sql/new";

export default function SetupPage() {
  const [copied, setCopied] = useState(false);
  const [sql, setSql] = useState("");

  useEffect(() => {
    fetch("/api/setup.sql")
      .then((r) => r.text())
      .then(setSql);
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(sql);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = sql;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <h1 className="text-xl font-bold">Setup Database WaBot Hub</h1>
          <p className="text-gray-500 text-sm mt-1">Cuma butuh 2 langkah</p>
        </div>

        {/* Step 1: Copy */}
        <div className="bg-[#111] rounded-xl p-4 space-y-3 border border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#25D366] text-black text-xs font-bold flex items-center justify-center">1</span>
            <span className="text-sm font-medium">Tekan tombol hijau ini:</span>
          </div>
          <button
            onClick={handleCopy}
            className={`w-full py-3 rounded-xl font-bold text-black text-sm transition-all active:scale-95 ${
              copied ? "bg-gray-400" : "bg-[#25D366] hover:bg-[#20bd5a]"
            }`}
          >
            {copied ? "Sudah di-Copy!" : "COPY SQL"}
          </button>
        </div>

        {/* Step 2: Paste & Run */}
        <div className="bg-[#111] rounded-xl p-4 space-y-3 border border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#25D366] text-black text-xs font-bold flex items-center justify-center">2</span>
            <span className="text-sm font-medium">Buka link ini, Paste, klik Run:</span>
          </div>
          <a
            href={SQL_EDITOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 rounded-xl font-bold text-center text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            Buka SQL Editor
          </a>
          <p className="text-xs text-gray-500 text-center">
            Di SQL Editor: hapus text lama, paste, klik Run
          </p>
        </div>

        {/* Preview */}
        <details className="bg-[#111] rounded-xl border border-white/5">
          <summary className="px-4 py-2 text-xs text-gray-500 cursor-pointer">Lihat SQL</summary>
          <pre className="px-4 pb-4 text-xs text-gray-400 overflow-x-auto font-mono">{sql}</pre>
        </details>
      </div>
    </div>
  );
}