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
            <div className="animate-fade-in-left">
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
            <div className="flex justify-center lg:justify-end animate-fade-in-right">
              <div className="relative">
                {/* glow behind phone */}
                <div className="absolute -inset-14 bg-red-600/[0.07] blur-[60px] rounded-full pointer-events-none animate-glow-pulse" />

                {/* phone frame — outer ring */}
                <div className="relative w-[280px] sm:w-[300px] lg:w-[310px] rounded-[44px] p-[2px] bg-gradient-to-b from-white/[0.12] to-white/[0.04] shadow-2xl shadow-black/80 animate-phone-float">
                  {/* phone body */}
                  <div className="relative bg-[#0f0f0f] rounded-[42px] p-[5px]">
                    {/* notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[26px] bg-[#0f0f0f] rounded-b-2xl z-10" />
                    <div className="absolute top-[7px] left-1/2 -translate-x-1/2 w-16 h-[18px] bg-black rounded-full z-10" />

                    {/* screen — fixed height, cropped top */}
                    <div className="rounded-[37px] overflow-hidden bg-black h-[520px] sm:h-[560px] lg:h-[580px] relative">
                      <Image
                        src="/phone-mockup.png"
                        alt="HakiPDF di mobile"
                        width={780}
                        height={1690}
                        className="w-full h-full object-cover object-top"
                        priority
                      />

                      {/* bottom fade */}
                      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                    </div>

                    {/* home indicator */}
                    <div className="absolute bottom-[9px] left-1/2 -translate-x-1/2 w-28 h-[4px] bg-white/10 rounded-full" />
                  </div>

                  {/* reflection shine */}
                  <div className="absolute top-3 left-3 w-20 h-40 bg-gradient-to-b from-white/[0.06] to-transparent rounded-full blur-xl pointer-events-none rotate-[-15deg]" />
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

        {/* faq */}
        <section className="border-t border-white/[0.06] py-20">
          <div className="max-w-xl mx-auto px-5">
            <p className="text-xs text-white/30 text-center uppercase tracking-widest mb-12">FAQ</p>
            <div className="space-y-2">
              {[
                { q: 'Format file apa aja yang didukung?', a: 'JPG, PNG, WebP, HEIC, dan PDF. Kalau filenya gambar, otomatis dikonversi ke JPEG sebelum masuk PDF.' },
                { q: 'File saya aman?', a: 'Semua proses berjalan di browser. File gak pernah dikirim ke server — langsung diproses di device kamu.' },
                { q: 'Ada batas ukuran file?', a: 'Gak ada batas dari sisi aplikasi. Tapi browser biasanya bisa handle file sampai ratusan MB tanpa masalah.' },
                { q: 'Bisa edit urutan dokumen?', a: 'Bisa. Setiap slot ada tombol panah atas/bawah buat pindah posisi. Dokumen yang sudah diurutkan akan mengikuti urutan itu di PDF.' },
                { q: 'Ini gratis?', a: 'Ya, sepenuhnya gratis. Gak perlu daftar, gak perlu login, gak ada iklan.' },
              ].map((item) => (
                <details key={item.q} className="group bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                    <span className="text-sm text-white/80 pr-4">{item.q}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 shrink-0 transition-transform group-open:rotate-180">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4">
                    <p className="text-xs text-white/40 leading-relaxed">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* contact */}
        <section className="border-t border-white/[0.06] py-16">
          <div className="max-w-5xl mx-auto px-5">
            <p className="text-xs text-white/30 text-center uppercase tracking-widest mb-10">Hubungi Kami</p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://wa.me/6288291414071"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.1] transition-all group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-green-500/70 group-hover:text-green-500 transition-colors">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor" />
                </svg>
                <div>
                  <p className="text-sm text-white/80 font-medium">WhatsApp</p>
                  <p className="text-[11px] text-white/30">0882-9141-4071</p>
                </div>
              </a>
              <a
                href="mailto:ardywikasa1@gmail.com"
                className="flex items-center gap-3 px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.1] transition-all group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 group-hover:text-white/50 transition-colors">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <div>
                  <p className="text-sm text-white/80 font-medium">Email</p>
                  <p className="text-[11px] text-white/30">ardywikasa1@gmail.com</p>
                </div>
              </a>
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
        <div className="max-w-5xl mx-auto px-5 py-6">
          <span className="text-xs text-white/15">HakiPDF</span>
        </div>
      </footer>
    </div>
  )
}