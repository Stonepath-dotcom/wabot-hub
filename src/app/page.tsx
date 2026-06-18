'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const statsRef = useRef<HTMLDivElement>(null)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            const delay = el.dataset.scrollDelay
            if (delay) {
              el.style.transitionDelay = delay + 'ms'
            }
            el.classList.add('scroll-visible')
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    document.querySelectorAll('.scroll-fade, .scroll-blur, .scroll-fade-scale, .scroll-fade-left, .scroll-fade-right').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  // counter animation for stats
  useEffect(() => {
    const container = statsRef.current
    if (!container) return

    const counters = container.querySelectorAll('[data-count]')
    let started = false

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true
          counters.forEach((el) => {
            const target = parseInt((el as HTMLElement).dataset.count || '0')
            const suffix = (el as HTMLElement).dataset.suffix || ''
            const duration = 1200
            const start = performance.now()

            const tick = (now: number) => {
              const elapsed = now - start
              const progress = Math.min(elapsed / duration, 1)
              const eased = 1 - Math.pow(1 - progress, 3)
              const current = Math.round(eased * target)
              el.textContent = current + suffix
              if (progress < 1) requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
          })
        }
      },
      { threshold: 0.5 }
    )

    obs.observe(container)
    return () => obs.disconnect()
  }, [])

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
        <section className="max-w-5xl mx-auto px-5 pt-20 sm:pt-28 pb-24 sm:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* text */}
            <div className="animate-fade-in-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-red-dot" />
                <span className="text-[11px] text-white/50">Gratis · Tanpa server · Output A4</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.15]">
                Dokumen lamaran,{' '}
                <span className="text-red-500">langsung jadi PDF.</span>
              </h1>

              <p className="mt-5 text-white/40 text-sm sm:text-[15px] max-w-md leading-relaxed">
                Upload foto tiap dokumen, urutkan sesuai kebutuhan, download PDF-nya. Semua di browser — file kamu tetap aman.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
                <Link
                  href="/buat"
                  className="hero-btn animate-cta-glow inline-flex items-center justify-center h-11 px-7 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-red-600/20"
                >
                  Mulai Buat Berkas
                </Link>
                <a
                  href="https://wa.me/6288291414071"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-btn inline-flex items-center justify-center h-11 px-7 bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white text-sm rounded-xl border border-white/[0.08]"
                >
                  Hubungi Kami
                </a>
              </div>
            </div>

            {/* phone mockup */}
            <div className="flex justify-center lg:justify-end animate-fade-in-right">
              <div className="relative">
                <div className="absolute -inset-16 bg-red-600/[0.08] blur-[80px] rounded-full pointer-events-none animate-glow-pulse" />
                <div className="relative w-[280px] sm:w-[300px] lg:w-[310px] rounded-[44px] p-[2px] bg-gradient-to-b from-white/[0.14] via-white/[0.08] to-white/[0.03] shadow-2xl shadow-black/80 animate-phone-float">
                  <div className="relative bg-[#0f0f0f] rounded-[42px] p-[5px]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[26px] bg-[#0f0f0f] rounded-b-2xl z-10" />
                    <div className="absolute top-[7px] left-1/2 -translate-x-1/2 w-16 h-[18px] bg-black rounded-full z-10" />
                    <div className="rounded-[37px] overflow-hidden bg-black h-[520px] sm:h-[560px] lg:h-[580px] relative">
                      <Image
                        src="/phone-mockup.png"
                        alt="HakiPDF di mobile"
                        width={780}
                        height={1690}
                        className="w-full h-full object-cover object-top"
                        priority
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                    </div>
                    <div className="absolute bottom-[9px] left-1/2 -translate-x-1/2 w-28 h-[4px] bg-white/10 rounded-full" />
                  </div>
                  <div className="absolute top-3 left-3 w-20 h-40 bg-gradient-to-b from-white/[0.08] to-transparent rounded-full blur-xl pointer-events-none rotate-[-15deg]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* shimmer divider */}
        <div className="shimmer-divider" />

        {/* stats strip */}
        <section ref={statsRef}>
          <div className="max-w-5xl mx-auto px-5 py-12 grid grid-cols-3 gap-4 text-center">
            {[
              { value: 13, suffix: '', label: 'Slot dokumen' },
              { value: 100, suffix: '%', label: 'Client-side' },
              { value: 0, suffix: '', label: 'Data dikirim' },
            ].map((stat, i) => (
              <div key={stat.label} className="scroll-blur stat-hover" data-scroll-delay={i * 120}>
                <p className="text-2xl sm:text-3xl font-bold text-white/90 tabular-nums" data-count={stat.value} data-suffix={stat.suffix}>0{stat.suffix}</p>
                <p className="text-[11px] text-white/30 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="shimmer-divider" />

        {/* feature highlights */}
        <section id="fitur" className="py-24">
          <div className="max-w-5xl mx-auto px-5">
            <p className="text-xs text-white/30 text-center uppercase tracking-widest mb-14 scroll-fade">Kenapa HakiPDF</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                  ),
                  title: 'Output A4 standar',
                  desc: 'PDF yang dihasilkan udah sesuai ukuran A4 — siap cetak langsung tanpa perlu resize lagi.',
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  ),
                  title: 'Drag & drop',
                  desc: 'Cukup drag file dari file manager langsung ke slot yang diinginkan. Gak perlu klik browse.',
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  ),
                  title: 'Gratis selamanya',
                  desc: 'Tanpa biaya, tanpa langganan, tanpa iklan. Fitur lengkap tanpa paywall.',
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  ),
                  title: 'Tanpa registrasi',
                  desc: 'Gak perlu buat akun, gak perlu login. Langsung buka dan pakai.',
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  ),
                  title: 'Bisa di HP',
                  desc: 'Responsif dan ringan. Kerja dari mana aja — laptop, tablet, atau HP.',
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  ),
                  title: 'Privasi terjamin',
                  desc: 'Semua proses lokal di browser. File gak pernah meninggalkan device kamu.',
                },
              ].map((item, i) => (
                <div key={item.title} className={`scroll-blur card-hover group bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 ${i < 3 ? 'scroll-fade-left' : 'scroll-fade-right'}`} data-scroll-delay={i * 100}>
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-white/35 feature-icon">
                    {item.icon}
                  </div>
                  <p className="text-sm font-semibold text-white/85">{item.title}</p>
                  <p className="text-xs text-white/30 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="shimmer-divider" />

        {/* cara kerja */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-5">
            <p id="cara-kerja" className="text-xs text-white/30 text-center uppercase tracking-widest mb-14 scroll-fade">Cara kerja</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Upload', desc: 'Foto dokumen ke slot yang sesuai. Didukung JPG, PNG, WebP, dan PDF.' },
                { step: '02', title: 'Urutkan', desc: 'Atur urutan dokumen pakai tombol panah. Wajib dan opsional udah ditandai.' },
                { step: '03', title: 'Download', desc: 'Preview hasilnya dulu. Kalau udah pas, download atau langsung cetak.' },
              ].map((item, i) => (
                <div key={item.step} className="scroll-fade card-hover relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-7" data-scroll-delay={i * 150}>
                  <span className="text-4xl font-bold text-white/[0.05] leading-none block">{item.step}</span>
                  <p className="text-sm font-semibold text-white/90 mt-4">{item.title}</p>
                  <p className="text-xs text-white/35 mt-2.5 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="shimmer-divider" />

        {/* dokumen didukung */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-5">
            <p className="text-xs text-white/30 text-center uppercase tracking-widest mb-4 scroll-fade">Dokumen yang didukung</p>
            <p className="text-sm text-white/40 text-center max-w-md mx-auto mb-14 leading-relaxed scroll-fade" data-scroll-delay="60">
              13 slot dokumen yang umum dibutuhkan saat melamar kerja. Wajib dan opsional udah ditandai otomatis.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { name: 'Pas Foto', tag: 'opsional' },
                { name: 'Surat Lamaran', tag: 'wajib' },
                { name: 'Daftar Riwayat Hidup', tag: 'wajib' },
                { name: 'KTP', tag: 'wajib' },
                { name: 'NPWP', tag: 'opsional' },
                { name: 'Ijazah', tag: 'wajib' },
                { name: 'SKCK', tag: 'opsional' },
                { name: 'Kartu Vaksin', tag: 'opsional' },
                { name: 'Sertifikat', tag: 'opsional' },
                { name: 'Kartu Keluarga', tag: 'wajib' },
                { name: 'Akta Kelahiran', tag: 'opsional' },
                { name: 'SK Sehat', tag: 'opsional' },
                { name: 'Daftar Nilai', tag: 'opsional' },
              ].map((doc, i) => (
                <div key={doc.name} className="scroll-fade doc-hover bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3.5 flex items-center justify-between" data-scroll-delay={i * 40}>
                  <span className="text-xs text-white/60 truncate mr-2">{doc.name}</span>
                  {doc.tag === 'wajib' && (
                    <span className="text-[10px] text-red-500/60 bg-red-500/[0.08] px-1.5 py-0.5 rounded-md shrink-0">wajib</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="shimmer-divider" />

        {/* faq */}
        <section className="py-24">
          <div className="max-w-xl mx-auto px-5">
            <p id="faq" className="text-xs text-white/30 text-center uppercase tracking-widest mb-14 scroll-fade">FAQ</p>
            <div className="space-y-3">
              {[
                { q: 'Format file apa aja yang didukung?', a: 'JPG, PNG, WebP, HEIC, dan PDF. Kalau filenya gambar, otomatis dikonversi ke JPEG sebelum masuk PDF.' },
                { q: 'File saya aman?', a: 'Semua proses berjalan di browser. File gak pernah dikirim ke server — langsung diproses di device kamu.' },
                { q: 'Ada batas ukuran file?', a: 'Gak ada batas dari sisi aplikasi. Tapi browser biasanya bisa handle file sampai ratusan MB tanpa masalah.' },
                { q: 'Bisa edit urutan dokumen?', a: 'Bisa. Setiap slot ada tombol panah atas/bawah buat pindah posisi. Dokumen yang sudah diurutkan akan mengikuti urutan itu di PDF.' },
                { q: 'Ini gratis?', a: 'Ya, sepenuhnya gratis. Gak perlu daftar, gak perlu login, gak ada iklan.' },
              ].map((item, i) => (
                <details key={item.q} className="scroll-fade faq-hover group bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden" data-scroll-delay={i * 80}>
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                    <span className="text-sm text-white/80 pr-4">{item.q}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 shrink-0 transition-transform duration-300 group-open:rotate-180">
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

        <div className="shimmer-divider" />

        {/* testimonials */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-5">
            <p className="text-xs text-white/30 text-center uppercase tracking-widest mb-14 scroll-fade">Kata mereka</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  name: 'Rina S.',
                  role: 'Fresh Graduate',
                  text: 'Gak nyangka se-simple ini. Tinggal upload foto dokumen, langsung jadi PDF. Gak perlu install app apapun.',
                },
                {
                  name: 'Bagus P.',
                  role: 'Job Seeker',
                  text: 'Dulu ribet banget scan satu-satu terus gabungin. Ini semua beres di browser dalam hitungan menit.',
                },
                {
                  name: 'Dewi A.',
                  role: 'Administrasi',
                  text: 'Yang paling penting file gak dikirim ke server. Buat dokumen pribadi ini sangat nyaman dipakai.',
                },
              ].map((item, i) => (
                <div key={item.name} className="scroll-blur card-hover bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6" data-scroll-delay={i * 150}>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-red-500/60 star-twinkle">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs text-white/45 leading-relaxed">&ldquo;{item.text}&rdquo;</p>
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <p className="text-xs font-medium text-white/60">{item.name}</p>
                    <p className="text-[11px] text-white/25 mt-0.5">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="shimmer-divider" />

        {/* contact */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-5">
            <p className="text-xs text-white/30 text-center uppercase tracking-widest mb-12 scroll-fade">Hubungi Kami</p>
            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 max-w-2xl mx-auto">
              <a
                href="https://wa.me/6288291414071"
                target="_blank"
                rel="noopener noreferrer"
                className="scroll-fade contact-hover flex items-center gap-3.5 px-6 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:bg-green-500/[0.06] hover:border-green-500/[0.15] group"
                data-scroll-delay="0"
              >
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-green-500/20 group-hover:scale-110">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-green-500/80 group-hover:text-green-400 transition-colors">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-white/80 font-medium">WhatsApp</p>
                  <p className="text-xs text-white/30 mt-0.5">0882-9141-4071</p>
                </div>
              </a>
              <a
                href="mailto:ardywikasa1@gmail.com"
                className="scroll-fade contact-hover flex items-center gap-3.5 px-6 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:bg-white/[0.06] hover:border-white/[0.12] group"
                data-scroll-delay="80"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-white/[0.08] group-hover:scale-110">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 group-hover:text-white/60 transition-colors">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-white/80 font-medium">Email</p>
                  <p className="text-xs text-white/30 mt-0.5">ardywikasa1@gmail.com</p>
                </div>
              </a>
              <div
                className="scroll-fade contact-hover flex items-center gap-3.5 px-6 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl"
                data-scroll-delay="160"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0 text-white/35">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-white/80 font-medium">Lokasi</p>
                  <p className="text-xs text-white/30 mt-0.5">Indonesia</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* cta */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-5">
            <div className="scroll-fade-scale cta-border relative bg-gradient-to-b from-red-950/30 to-transparent rounded-3xl px-8 py-16 sm:py-20 text-center overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-600/[0.08] blur-[100px] rounded-full pointer-events-none animate-glow-pulse" />
              <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-red-600/[0.04] blur-[60px] rounded-full pointer-events-none" style={{ animation: 'glow-pulse 5s ease-in-out 1.5s infinite' }} />
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/90 relative">
                Siap bikin berkas lamaran?
              </h2>
              <p className="mt-3 text-sm text-white/35 max-w-sm mx-auto leading-relaxed relative">
                Gratis, tanpa daftar, langsung pakai. Mulai dari upload sampai download PDF dalam hitungan menit.
              </p>
              <Link
                href="/buat"
                className="animate-cta-glow relative inline-flex items-center justify-center h-12 px-9 mt-8 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-600/25 hover:scale-105"
              >
                Mulai Sekarang
              </Link>
            </div>
          </div>
        </section>

        {/* privacy */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-5">
            <div className="scroll-fade max-w-md mx-auto text-center">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-5 animate-subtle-float">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/25">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <p className="text-sm text-white/40 leading-relaxed">
                Semua proses berjalan di browser kamu. File gak pernah dikirim ke server manapun — datamu tetap milikmu.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* trust badges strip */}
      <div className="shimmer-divider" />
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-5">
          <div className="scroll-fade flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] text-white/25 uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/15"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Client-side Processing
            </span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/15"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              100% Gratis
            </span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/15"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
              No Registration
            </span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/15"><polyline points="20 6 9 17 4 12" /></svg>
              Tanpa Watermark
            </span>
          </div>
        </div>
      </section>

      {/* full footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-5 pt-14 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-14">
            {/* col 1 - brand + alamat */}
            <div className="col-span-2 sm:col-span-1 scroll-fade" data-scroll-delay="0">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-white/80">HakiPDF</span>
              </div>
              <p className="text-[11px] text-white/25 leading-relaxed mb-5">
                Tool gratis untuk mengubah foto dokumen lamaran kerja menjadi PDF profesional langsung di browser.
              </p>
              <div className="flex items-start gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/15 mt-0.5 shrink-0">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <p className="text-[11px] text-white/20 leading-relaxed">Indonesia</p>
              </div>
            </div>

            {/* col 2 - quick links */}
            <div className="scroll-fade" data-scroll-delay="60">
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-5">Navigasi</p>
              <ul className="space-y-3">
                <li><Link href="/buat" className="text-[11px] text-white/25 hover:text-white/50 transition-colors duration-200 footer-link">Buat PDF</Link></li>
                <li><Link href="/#faq" className="text-[11px] text-white/25 hover:text-white/50 transition-colors duration-200 footer-link">FAQ</Link></li>
                <li><Link href="/#fitur" className="text-[11px] text-white/25 hover:text-white/50 transition-colors duration-200 footer-link">Fitur</Link></li>
                <li><Link href="/#cara-kerja" className="text-[11px] text-white/25 hover:text-white/50 transition-colors duration-200 footer-link">Cara Kerja</Link></li>
              </ul>
            </div>

            {/* col 3 - dukungan */}
            <div className="scroll-fade" data-scroll-delay="120">
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-5">Dukungan</p>
              <ul className="space-y-3">
                <li>
                  <a href="https://wa.me/6288291414071" target="_blank" rel="noopener noreferrer" className="text-[11px] text-white/25 hover:text-white/50 transition-colors duration-200 footer-link">WhatsApp</a>
                </li>
                <li>
                  <a href="mailto:ardywikasa1@gmail.com" className="text-[11px] text-white/25 hover:text-white/50 transition-colors duration-200 footer-link">Email</a>
                </li>
                <li>
                  <a href="#" className="text-[11px] text-white/25 hover:text-white/50 transition-colors duration-200 footer-link">Laporkan Bug</a>
                </li>
                <li>
                  <a href="#" className="text-[11px] text-white/25 hover:text-white/50 transition-colors duration-200 footer-link">Saran & Masukan</a>
                </li>
              </ul>
            </div>

            {/* col 4 - legal */}
            <div className="scroll-fade" data-scroll-delay="180">
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-5">Legal</p>
              <ul className="space-y-3">
                <li><a href="#" className="text-[11px] text-white/25 hover:text-white/50 transition-colors duration-200 footer-link">Privacy Policy</a></li>
                <li><a href="#" className="text-[11px] text-white/25 hover:text-white/50 transition-colors duration-200 footer-link">Terms of Service</a></li>
                <li><a href="#" className="text-[11px] text-white/25 hover:text-white/50 transition-colors duration-200 footer-link">Disclaimer</a></li>
              </ul>

              {/* social links */}
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/[0.06]">
                <a href="#" className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-200 group">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-white/45 transition-colors">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-200 group">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-white/45 transition-colors">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-200 group">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white/20 group-hover:text-white/45 transition-colors">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.83a8.2 8.2 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* bottom bar */}
          <div className="shimmer-divider mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-white/15">&copy; {new Date().getFullYear()} HakiPDF. Semua hak dilindungi.</p>
            <p className="text-[10px] text-white/10">Dibuat dengan <span className="text-red-500/40">&#9829;</span> di Indonesia</p>
          </div>
        </div>
      </footer>

      {/* back to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`back-to-top fixed bottom-6 right-6 z-50 w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm flex items-center justify-center hover:bg-white/[0.1] hover:border-white/[0.15] group ${showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        aria-label="Kembali ke atas"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 group-hover:text-white/60 transition-colors">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </div>
  )
}