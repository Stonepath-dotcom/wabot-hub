import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-between">
          <span className="text-sm font-bold text-red-600 tracking-tight">HakiPDF</span>
          <a
            href="https://wa.me/6288291414071"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Kontak
          </a>
        </div>
      </nav>

      {/* hero */}
      <main className="flex-1">
        {/* section 1 — intro */}
        <section className="max-w-3xl mx-auto px-4 pt-16 pb-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600 mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <p className="mt-3 text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
            Upload foto dokumen lamaran kerja, urutkan, langsung jadi PDF.
          </p>

          <Link
            href="/buat"
            className="inline-flex items-center justify-center mt-7 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Mulai Buat Berkas
          </Link>

          <div className="mt-5 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>JPG, PNG, WebP, PDF</span>
            <span className="text-gray-200">|</span>
            <span>Output A4</span>
            <span className="text-gray-200">|</span>
            <span>Gratis</span>
          </div>
        </section>

        {/* section 2 — screenshot */}
        <section className="max-w-2xl mx-auto px-4 pb-14">
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-lg shadow-gray-200/50">
            <Image
              src="/preview.png"
              alt="Tampilan HakiPDF"
              width={1280}
              height={900}
              className="w-full h-auto"
              priority
            />
          </div>
        </section>

        {/* section 3 — cara kerja */}
        <section className="bg-gray-50 border-t border-b border-gray-100 py-12">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-sm font-semibold text-gray-900 text-center mb-8">Cara kerja</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Upload', desc: 'Foto setiap dokumen ke slot yang sesuai' },
                { step: '2', title: 'Urutkan', desc: 'Atur urutan dokumen dengan tombol panah' },
                { step: '3', title: 'Download', desc: 'Preview dulu, lalu download atau cetak PDF' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-xs font-bold mb-3">
                    {item.step}
                  </div>
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* section 4 — privacy */}
        <section className="py-10">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-xs text-gray-500">Privasi</span>
            </div>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Semua proses berjalan di browser kamu. File gak pernah dikirim ke server manapun.
            </p>
          </div>
        </section>
      </main>

      {/* footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-gray-400">HakiPDF</span>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <a
                href="https://wa.me/6288291414071"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-600 transition-colors"
              >
                0882-9141-4071
              </a>
              <a
                href="mailto:ardywikasa1@gmail.com"
                className="hover:text-gray-600 transition-colors"
              >
                ardywikasa1@gmail.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}