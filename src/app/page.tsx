import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
      {/* nav */}
      <nav className="border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">HakiPDF</span>
          </div>
          <a
            href="https://wa.me/6288291414071"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Kontak
          </a>
        </div>
      </nav>

      <main className="flex-1">
        {/* hero + phone */}
        <section className="max-w-5xl mx-auto px-5 pt-16 sm:pt-24 pb-20 sm:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-[11px] text-white/50">Gratis · Tanpa server · Output A4</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.15]">
                Dokumen lamaran,{' '}
                <span className="text-red-500">langsung jadi PDF.</span>
              </h1>

              <p className="mt-4 text-white/40 text-sm sm:text-[15px] max-w-sm leading-relaxed">
                Upload foto tiap dokumen, urutkan sesuai kebutuhan, download PDF-nya. Semua di browser — file kamu tetap aman.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
                <Link
                  href="/buat"
                  className="inline-flex items-center justify-center px-7 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-red-600/20"
                >
                  Mulai Buat Berkas
                </Link>
                <a
                  href="https://wa.me/6288291414071"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-7 py-3 bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white text-sm rounded-xl border border-white/[0.08] transition-all"
                >
                  Hubungi Kami
                </a>
              </div>
            </div>

            {/* phone mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* glow behind phone */}
                <div className="absolute -inset-12 bg-red-600/[0.08] blur-3xl rounded-full pointer-events-none" />

                {/* phone frame */}
                <div className="relative w-[300px] sm:w-[340px] lg:w-[360px] bg-[#1a1a1a] rounded-[40px] p-[7px] shadow-2xl shadow-black/70 border border-white/[0.08]">
                  {/* notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#1a1a1a] rounded-b-2xl z-10" />

                  {/* screen */}
                  <div className="rounded-[33px] overflow-hidden bg-black">
                    <Image
                      src="/phone-mockup.png"
                      alt="HakiPDF di mobile"
                      width={780}
                      height={1690}
                      className="w-full h-auto"
                      priority
                    />
                  </div>

                  {/* home indicator */}
                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/15 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* stats strip */}
        <section className="border-y border-white/[0.06]">
          <div className="max-w-5xl mx-auto px-5 py-8 grid grid-cols-3 gap-4 text-center">
            {[
              { value: '13', label: 'Slot dokumen' },
              { value: '100%', label: 'Client-side' },
              { value: '0', label: 'Data dikirim' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl sm:text-2xl font-bold text-white/90">{stat.value}</p>
                <p className="text-[11px] text-white/30 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* cara kerja */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-5">
            <p className="text-xs text-white/30 text-center uppercase tracking-widest mb-12">Cara kerja</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
              {[
                { step: '01', title: 'Upload', desc: 'Foto dokumen ke slot yang sesuai. Didukung JPG, PNG, WebP, dan PDF.' },
                { step: '02', title: 'Urutkan', desc: 'Atur urutan dokumen pakai tombol panah. Wajib dan opsional udah ditandai.' },
                { step: '03', title: 'Download', desc: 'Preview hasilnya dulu. Kalau udah pas, download atau langsung cetak.' },
              ].map((item) => (
                <div key={item.step} className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                  <span className="text-3xl font-bold text-white/[0.06] leading-none">{item.step}</span>
                  <p className="text-sm font-semibold text-white/90 mt-3">{item.title}</p>
                  <p className="text-xs text-white/35 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* privacy */}
        <section className="border-t border-white/[0.06] py-16">
          <div className="max-w-5xl mx-auto px-5">
            <div className="max-w-lg mx-auto text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                Semua proses berjalan di browser kamu. File gak pernah dikirim ke server manapun — datamu tetap milikmu.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-white/20">HakiPDF</span>
          <div className="flex items-center gap-5 text-xs text-white/25">
            <a
              href="https://wa.me/6288291414071"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/50 transition-colors"
            >
              0882-9141-4071
            </a>
            <a
              href="mailto:ardywikasa1@gmail.com"
              className="hover:text-white/50 transition-colors"
            >
              ardywikasa1@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}