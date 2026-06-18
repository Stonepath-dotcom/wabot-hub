import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-12 flex items-center">
          <span className="text-sm font-bold text-red-600 tracking-tight">HakiPDF</span>
        </div>
      </nav>

      {/* hero */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center py-20">
          {/* logo mark */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600 mb-8">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            HakiPDF
          </h1>
          <p className="mt-3 text-gray-500 text-sm leading-relaxed">
            Upload foto dokumen lamaran kerja, urutkan, langsung jadi PDF. Semua proses di browser — file gak dikirim ke server manapun.
          </p>

          <Link
            href="/buat"
            className="inline-flex items-center justify-center mt-8 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Mulai Buat Berkas
          </Link>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>JPG, PNG, WebP, PDF</span>
            <span className="text-gray-200">|</span>
            <span>Output A4</span>
            <span className="text-gray-200">|</span>
            <span>Gratis</span>
          </div>
        </div>
      </main>

      {/* footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 text-center text-xs text-gray-400">
          HakiPDF
        </div>
      </footer>
    </div>
  )
}