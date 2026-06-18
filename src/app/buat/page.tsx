'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import {
  ArrowUp,
  ArrowDown,
  X,
  Eye,
  Download,
  RotateCcw,
  Upload,
  Printer,
  ChevronLeft,
  Loader2,
  RotateCw,
  ZoomIn,
  FileText,
  ImageIcon,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────── */

interface DocSlot {
  id: string
  label: string
  desc: string
  required: boolean
}

interface UploadedFile {
  file: File
  preview: string
  dataUrl: string
  rotation: number
}

interface PreviewPage {
  label: string
  preview: string
  isPdf: boolean
}

type PaperSize = 'a4' | 'letter' | 'f4'

const PAPER_DIMS: Record<PaperSize, [number, number]> = {
  a4: [595, 842],
  letter: [612, 792],
  f4: [609, 936],
}

const PAPER_LABELS: Record<PaperSize, string> = {
  a4: 'A4',
  letter: 'Letter',
  f4: 'F4/Folio',
}

const QUALITY_OPTIONS = [
  { value: 0.5, label: 'Kecil', desc: 'File ringan' },
  { value: 0.75, label: 'Sedang', desc: 'Seimbang' },
  { value: 0.92, label: 'Tinggi', desc: 'Kualitas maksimal' },
]

/* ─── Document Slots ────────────────────────────────── */

const docSlots: DocSlot[] = [
  { id: 'pas_foto', label: 'Pas Foto', desc: '3x4 / 4x6', required: false },
  { id: 'surat_lamaran', label: 'Surat Lamaran', desc: 'surat lamaran pekerjaan', required: true },
  { id: 'riwayat_hidup', label: 'Daftar Riwayat Hidup', desc: 'CV', required: true },
  { id: 'ktp', label: 'KTP', desc: 'fotokopi KTP', required: true },
  { id: 'npwp', label: 'NPWP', desc: 'fotokopi NPWP', required: false },
  { id: 'ijazah', label: 'Ijazah', desc: 'fotokopi ijazah terakhir', required: true },
  { id: 'skck', label: 'SKCK', desc: 'fotokopi SKCK', required: false },
  { id: 'kartu_vaksin', label: 'Kartu Vaksin', desc: 'fotokopi kartu vaksin', required: false },
  { id: 'sertifikat', label: 'Sertifikat', desc: 'sertifikat pendukung', required: false },
  { id: 'kartu_keluarga', label: 'Kartu Keluarga', desc: 'fotokopi KK', required: true },
  { id: 'akta_lahir', label: 'Akta Kelahiran', desc: 'fotokopi akta lahir', required: false },
  { id: 'sk_sehat', label: 'SK Sehat', desc: 'surat keterangan sehat', required: false },
  { id: 'daftar_nilai', label: 'Daftar Nilai', desc: 'transkrip / rapor', required: false },
]

/* ─── Helpers ───────────────────────────────────────── */

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function imageToJpegBytes(dataUrl: string, rotation: number, quality: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const isRotated = rotation === 90 || rotation === 270
      canvas.width = isRotated ? img.naturalHeight : img.naturalWidth
      canvas.height = isRotated ? img.naturalWidth : img.naturalHeight
      const ctx = canvas.getContext('2d')!

      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
      ctx.restore()

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Canvas toBlob gagal')); return }
          blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf))).catch(reject)
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => reject(new Error('Gambar tidak bisa dibaca'))
    img.src = dataUrl
  })
}

async function addImageToPdf(
  pdfDoc: PDFDocument,
  dataUrl: string,
  rotation: number,
  quality: number,
  paperSize: PaperSize
) {
  const jpgBytes = await imageToJpegBytes(dataUrl, rotation, quality)
  const image = await pdfDoc.embedJpg(jpgBytes)

  const [pw, ph] = PAPER_DIMS[paperSize]
  const page = pdfDoc.addPage([pw, ph])
  const { width: iw, height: ih } = image.scale(1)

  const scale = Math.min(pw / iw, ph / ih)
  const drawW = iw * scale
  const drawH = ih * scale
  const x = (pw - drawW) / 2
  const y = (ph - drawH) / 2

  page.drawImage(image, { x, y, width: drawW, height: drawH })
}

/* ─── Main Component ────────────────────────────────── */

export default function BuatBerkas() {
  const [uploads, setUploads] = useState<Record<string, UploadedFile>>({})
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [globalDrag, setGlobalDrag] = useState(false)
  const [previewPages, setPreviewPages] = useState<PreviewPage[] | null>(null)
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null)
  const [paperSize, setPaperSize] = useState<PaperSize>('a4')
  const [quality, setQuality] = useState(0.75)
  const [zoomSlot, setZoomSlot] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const uploadedCount = Object.keys(uploads).length
  const requiredSlots = docSlots.filter((s) => s.required)
  const uploadedRequired = requiredSlots.filter((s) => uploads[s.id]).length

  /* ── Global drag & drop ── */
  useEffect(() => {
    let dragCount = 0

    const onDragEnter = (e: DragEvent) => {
      e.preventDefault()
      dragCount++
      if (e.dataTransfer?.types.includes('Files')) setGlobalDrag(true)
    }
    const onDragLeave = (e: DragEvent) => {
      e.preventDefault()
      dragCount--
      if (dragCount <= 0) { dragCount = 0; setGlobalDrag(false) }
    }
    const onDragOver = (e: DragEvent) => e.preventDefault()
    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      dragCount = 0
      setGlobalDrag(false)

      const files = Array.from(e.dataTransfer?.files || [])
      const imagePdfFiles = files.filter(
        (f) => f.type.startsWith('image/') || f.type === 'application/pdf' || /\.(jpg|jpeg|png|webp|heic|heif|bmp|gif|tiff?|pdf)$/i.test(f.name)
      )

      if (imagePdfFiles.length === 0) return

      // auto-assign files to empty slots
      const emptySlots = docSlots.filter((s) => !uploads[s.id])
      const toAssign = imagePdfFiles.slice(0, emptySlots.length)

      if (toAssign.length < imagePdfFiles.length) {
        setError(`${imagePdfFiles.length - toAssign.length} file tidak bisa ditambahkan — slot sudah penuh.`)
      }

      toAssign.forEach((file, i) => {
        const slot = emptySlots[i]
        if (!slot) return
        const isImage = file.type.startsWith('image/')
        const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
        if (!isImage && !isPdf) return
        fileToDataUrl(file).then((dataUrl) => {
          const preview = URL.createObjectURL(file)
          setUploads((prev) => ({
            ...prev,
            [slot.id]: { file, preview, dataUrl, rotation: 0 },
          }))
        })
      })
    }

    document.addEventListener('dragenter', onDragEnter)
    document.addEventListener('dragleave', onDragLeave)
    document.addEventListener('dragover', onDragOver)
    document.addEventListener('drop', onDrop)

    return () => {
      document.removeEventListener('dragenter', onDragEnter)
      document.removeEventListener('dragleave', onDragLeave)
      document.removeEventListener('dragover', onDragOver)
      document.removeEventListener('drop', onDrop)
    }
  }, [uploads])

  /* ── Upload handlers ── */

  const handleFile = useCallback(async (slotId: string, file: File) => {
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic|heif|bmp|gif|tiff?)$/i.test(file.name)
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
    if (!isImage && !isPdf) return
    const dataUrl = await fileToDataUrl(file)
    const preview = URL.createObjectURL(file)
    setUploads((prev) => ({ ...prev, [slotId]: { file, preview, dataUrl, rotation: 0 } }))
    setError(null)
  }, [])

  const handleDrop = useCallback(
    (slotId: string, e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragOver(null)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(slotId, file)
    },
    [handleFile]
  )

  const handleRemove = useCallback((slotId: string) => {
    setUploads((prev) => {
      const next = { ...prev }
      if (next[slotId]) {
        URL.revokeObjectURL(next[slotId].preview)
        delete next[slotId]
      }
      return next
    })
    setError(null)
  }, [])

  const handleReplace = useCallback(
    (slotId: string) => {
      const input = fileInputRefs.current[slotId]
      if (input) input.click()
    },
    []
  )

  const handleResetAll = useCallback(() => {
    Object.values(uploads).forEach((u) => URL.revokeObjectURL(u.preview))
    setUploads({})
    setError(null)
    setProgress(0)
  }, [uploads])

  const handleRotate = useCallback((slotId: string) => {
    setUploads((prev) => {
      const u = prev[slotId]
      if (!u) return prev
      return {
        ...prev,
        [slotId]: { ...u, rotation: (u.rotation + 90) % 360 },
      }
    })
  }, [])

  /* ── Move up / down ── */

  const handleMove = useCallback(
    (slotId: string, dir: 'up' | 'down') => {
      const ids = docSlots.map((s) => s.id)
      const idx = ids.indexOf(slotId)
      if (dir === 'up' && idx <= 0) return
      if (dir === 'down' && idx >= ids.length - 1) return

      const swapWith = dir === 'up' ? ids[idx - 1] : ids[idx + 1]
      setUploads((prev) => {
        const next = { ...prev }
        const a = next[slotId]
        const b = next[swapWith]
        if (a) delete next[slotId]
        if (b) delete next[swapWith]
        if (b) next[slotId] = b
        if (a) next[swapWith] = a
        return next
      })
    },
    []
  )

  /* ── Preview & Generate PDF ── */

  const handlePreview = useCallback(async () => {
    if (uploadedCount === 0) return

    setGenerating(true)
    setProgress(0)
    setError(null)

    try {
      const pdfDoc = await PDFDocument.create()
      const orderedSlots = docSlots.filter((s) => uploads[s.id])
      const pages: PreviewPage[] = []
      let done = 0

      for (const slot of orderedSlots) {
        const u = uploads[slot.id]
        if (!u) continue

        const isPdf = u.dataUrl.startsWith('data:application/pdf')

        try {
          if (isPdf) {
            const res = await fetch(u.dataUrl)
            const buf = await res.arrayBuffer()
            const srcDoc = await PDFDocument.load(new Uint8Array(buf))
            const copied = await pdfDoc.copyPages(srcDoc, srcDoc.getPageIndices())
            copied.forEach((p) => {
              pdfDoc.addPage(p)
              pages.push({ label: `${slot.label} (hal. ${copied.indexOf(p) + 1})`, preview: u.preview, isPdf: true })
            })
          } else {
            await addImageToPdf(pdfDoc, u.dataUrl, u.rotation, quality, paperSize)
            pages.push({ label: slot.label, preview: u.preview, isPdf: false })
          }
        } catch (err) {
          console.error(`Gagal memproses ${slot.label}:`, err)
        }

        done++
        setProgress(Math.round((done / orderedSlots.length) * 100))
      }

      if (pdfDoc.getPageCount() === 0) {
        setError('Tidak ada dokumen yang bisa diproses.')
        setGenerating(false)
        return
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setPreviewPages(pages)
      setPreviewPdfUrl(url)
    } catch (err) {
      console.error('Preview error:', err)
      setError('Gagal membuat preview. Coba lagi.')
    } finally {
      setGenerating(false)
    }
  }, [uploads, uploadedCount, quality, paperSize])

  const handleDownloadFromPreview = useCallback(() => {
    if (!previewPdfUrl) return
    const a = document.createElement('a')
    a.href = previewPdfUrl
    a.download = `Berkas_Lamaran_${PAPER_LABELS[paperSize]}.pdf`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => document.body.removeChild(a), 500)
  }, [previewPdfUrl, paperSize])

  const handlePrintFromPreview = useCallback(() => {
    if (!previewPdfUrl) return
    const win = window.open(previewPdfUrl, '_blank')
    if (win) win.onload = () => win.print()
  }, [previewPdfUrl])

  const handleClosePreview = useCallback(() => {
    if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl)
    setPreviewPages(null)
    setPreviewPdfUrl(null)
  }, [previewPdfUrl])

  /* ── Zoom Modal ── */

  const zoomedUpload = zoomSlot ? uploads[zoomSlot] : null
  const zoomSlotData = zoomSlot ? docSlots.find((s) => s.id === zoomSlot) : null

  /* ── Preview View ── */

  if (previewPages && previewPdfUrl) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
        {/* preview header */}
        <div className="bg-[#111] border-b border-white/[0.06] px-5 h-12 flex items-center justify-between sticky top-0 z-50">
          <button
            onClick={handleClosePreview}
            className="flex items-center gap-1.5 text-white/50 hover:text-white/90 text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </button>
          <span className="text-xs text-white/25">
            {previewPages.length} halaman · {PAPER_LABELS[paperSize]}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrintFromPreview}
              className="flex items-center gap-1.5 h-8 px-3 text-xs text-white/50 hover:text-white/90 hover:bg-white/[0.06] rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={handleDownloadFromPreview}
              className="flex items-center gap-1.5 h-8 px-3 text-xs text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        </div>

        {/* preview pages */}
        <main className="flex-1 px-4 py-8 sm:px-8 sm:py-12">
          <div className="flex flex-col items-center gap-8 pb-24">
            {previewPages.map((page, i) => (
              <div key={i} className="w-full max-w-[595px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] text-white/20 font-medium tabular-nums w-4">{i + 1}</span>
                  <span className="text-[11px] text-white/10">·</span>
                  <span className="text-[11px] text-white/30 truncate">{page.label}</span>
                </div>
                <div className="bg-white rounded-lg overflow-hidden shadow-xl shadow-black/40 border border-white/[0.06]">
                  <div
                    className="w-full bg-white"
                    style={{ aspectRatio: `${PAPER_DIMS[paperSize][0]} / ${PAPER_DIMS[paperSize][1]}` }}
                  >
                    {page.isPdf ? (
                      <div className="w-full h-full flex items-center justify-center bg-[#fafafa]">
                        <span className="text-xs text-gray-400">PDF — {page.label}</span>
                      </div>
                    ) : (
                      <img
                        src={page.preview}
                        alt={page.label}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* preview bottom bar */}
        <div className="fixed bottom-0 inset-x-0 bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-white/[0.06] z-50">
          <div className="max-w-[595px] mx-auto px-4 py-3 flex items-center gap-2">
            <button
              onClick={handleClosePreview}
              className="h-9 px-4 text-sm text-white/50 hover:text-white/90 hover:bg-white/[0.06] rounded-lg transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDownloadFromPreview}
              className="flex-1 h-9 flex items-center justify-center gap-2 px-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Upload View ── */

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
      {/* header */}
      <header className="bg-[#0a0a0a] border-b border-white/[0.06] sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-5 h-12 flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded-md bg-red-600 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white/80 hover:text-white transition-colors">HakiPDF</span>
          </a>
          <span className="text-white/10">/</span>
          <span className="text-sm text-white/30">Buat Berkas</span>
          <div className="flex-1" />
          {uploadedCount > 0 && (
            <span className="text-[11px] text-white/25 tabular-nums">
              {uploadedRequired}/{requiredSlots.length} wajib
              <span className="text-white/10 mx-1.5">·</span>
              {uploadedCount} total
            </span>
          )}
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-6">
          {/* error */}
          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-950/50 border border-red-900/50 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          {/* upload slots */}
          <div className="space-y-3">
            {docSlots.map((slot) => {
              const uploaded = uploads[slot.id]
              const idx = docSlots.indexOf(slot)
              const isPdf = uploaded?.file.type === 'application/pdf' || uploaded?.file.name.endsWith('.pdf')

              return (
                <div
                  key={slot.id}
                  className={`bg-[#111] border rounded-xl overflow-hidden transition-colors ${
                    dragOver === slot.id
                      ? 'border-white/20 bg-white/[0.04]'
                      : uploaded
                        ? 'border-white/[0.12]'
                        : 'border-white/[0.06]'
                  }`}
                >
                  {/* slot header */}
                  <div className="flex items-center gap-2 px-4 py-3.5">
                    <span className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-white/80">
                        {slot.label}
                        {slot.required && <span className="text-red-500/70 ml-1">*</span>}
                      </span>
                      <span className="text-xs text-white/20 ml-2">{slot.desc}</span>
                    </span>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => handleMove(slot.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded-md hover:bg-white/[0.06] disabled:opacity-15 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5 text-white/25" />
                      </button>
                      <button
                        onClick={() => handleMove(slot.id, 'down')}
                        disabled={idx === docSlots.length - 1}
                        className="p-1 rounded-md hover:bg-white/[0.06] disabled:opacity-15 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-white/25" />
                      </button>
                    </div>
                  </div>

                  {/* slot body */}
                  <div className="px-4 pb-4">
                    {uploaded ? (
                      <div className="relative group">
                        <div
                          className="rounded-lg overflow-hidden border border-white/[0.08] bg-[#0a0a0a] cursor-pointer"
                          onClick={() => setZoomSlot(slot.id)}
                        >
                          {isPdf ? (
                            <div className="w-full h-40 sm:h-48 flex flex-col items-center justify-center bg-[#fafafa]">
                              <FileText className="w-8 h-8 text-gray-300 mb-2" />
                              <span className="text-xs text-gray-400">PDF Document</span>
                            </div>
                          ) : (
                            <img
                              src={uploaded.preview}
                              alt={slot.label}
                              className="w-full h-40 sm:h-48 object-contain bg-white"
                              style={{ transform: `rotate(${uploaded.rotation}deg)`, transition: 'transform 0.3s ease' }}
                            />
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => setZoomSlot(slot.id)}
                            className="p-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors"
                            title="Zoom"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                          {!isPdf && (
                            <button
                              onClick={() => handleRotate(slot.id)}
                              className="p-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors"
                              title="Putar 90°"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleReplace(slot.id)}
                            className="px-3 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg text-xs font-medium hover:bg-white/20 transition-colors"
                          >
                            Ganti
                          </button>
                          <button
                            onClick={() => handleRemove(slot.id)}
                            className="p-2 bg-red-600/80 backdrop-blur-sm text-white rounded-lg hover:bg-red-600 transition-colors"
                            title="Hapus"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="mt-1.5 text-[11px] text-white/20 truncate">
                          {uploaded.file.name} · {(uploaded.file.size / 1024).toFixed(0)} KB
                          {!isPdf && uploaded.rotation > 0 && (
                            <span className="ml-1.5 text-white/15">· diputar {uploaded.rotation}°</span>
                          )}
                        </p>
                      </div>
                    ) : (
                      <div
                        className={`border border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                          dragOver === slot.id
                            ? 'border-white/20 bg-white/[0.04]'
                            : 'border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]'
                        }`}
                        onClick={() => {
                          const input = fileInputRefs.current[slot.id]
                          if (input) input.click()
                        }}
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setDragOver(slot.id)
                        }}
                        onDragLeave={(e) => {
                          e.stopPropagation()
                          setDragOver(null)
                        }}
                        onDrop={(e) => handleDrop(slot.id, e)}
                      >
                        <Upload className="w-5 h-5 text-white/15 mb-2" />
                        <p className="text-xs text-white/25">
                          Klik atau drag file ke sini
                        </p>
                        <p className="text-[11px] text-white/10 mt-1">JPG, PNG, WebP, PDF</p>
                      </div>
                    )}
                  </div>

                  <input
                    ref={(el) => { fileInputRefs.current[slot.id] = el }}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFile(slot.id, file)
                      e.target.value = ''
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* global drag overlay */}
      {globalDrag && (
        <div className="fixed inset-0 z-[60] bg-[#0a0a0a]/90 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center mb-4">
            <ImageIcon className="w-7 h-7 text-white/30" />
          </div>
          <p className="text-sm text-white/40 font-medium">Lepas file di sini</p>
          <p className="text-xs text-white/15 mt-1">Otomatis masuk ke slot kosong</p>
        </div>
      )}

      {/* zoom modal */}
      {zoomSlot && zoomedUpload && zoomSlotData && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomSlot(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* zoom header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/70 font-medium">{zoomSlotData.label}</span>
                {!zoomedUpload.file.name.endsWith('.pdf') && zoomedUpload.rotation > 0 && (
                  <span className="text-[11px] text-white/25 bg-white/[0.06] px-2 py-0.5 rounded-full">{zoomedUpload.rotation}°</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {!zoomedUpload.file.name.endsWith('.pdf') && (
                  <button
                    onClick={() => handleRotate(zoomSlot)}
                    className="flex items-center gap-1.5 h-8 px-3 text-xs text-white/50 hover:text-white/90 hover:bg-white/[0.06] rounded-lg transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Putar
                  </button>
                )}
                <button
                  onClick={() => setZoomSlot(null)}
                  className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>
            </div>

            {/* zoom image */}
            <div className="flex-1 bg-[#111] rounded-xl border border-white/[0.08] overflow-hidden flex items-center justify-center min-h-0">
              {zoomedUpload.file.name.endsWith('.pdf') ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-white/15 mb-3" />
                  <span className="text-sm text-white/25">PDF Document</span>
                  <span className="text-xs text-white/10 mt-1">{zoomedUpload.file.name}</span>
                </div>
              ) : (
                <img
                  src={zoomedUpload.preview}
                  alt={zoomSlotData.label}
                  className="max-w-full max-h-[70vh] object-contain"
                  style={{ transform: `rotate(${zoomedUpload.rotation}deg)`, transition: 'transform 0.3s ease' }}
                />
              )}
            </div>

            <p className="mt-2 text-center text-[11px] text-white/15">
              {zoomedUpload.file.name} · {(zoomedUpload.file.size / 1024).toFixed(0)} KB
            </p>
          </div>
        </div>
      )}

      {/* bottom bar */}
      {uploadedCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-white/[0.06] z-50">
          <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-2.5">
            <button
              onClick={handleResetAll}
              className="h-10 flex items-center gap-1.5 px-3 sm:px-4 text-sm text-white/30 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* settings toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`h-10 px-3 text-sm rounded-xl transition-colors flex items-center gap-1.5 ${
                showSettings
                  ? 'text-white/80 bg-white/[0.08]'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="hidden sm:inline">{PAPER_LABELS[paperSize]} · {QUALITY_OPTIONS.find((q) => q.value === quality)?.label}</span>
            </button>

            <button
              onClick={handlePreview}
              disabled={generating}
              className="flex-1 h-10 flex items-center justify-center gap-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-white/10 text-white disabled:text-white/30 text-sm font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-red-600/20"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {progress}%
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Preview PDF
                </>
              )}
            </button>
          </div>

          {/* settings panel */}
          {showSettings && (
            <div className="max-w-2xl mx-auto px-5 pb-3">
              <div className="bg-[#111] border border-white/[0.08] rounded-xl p-4">
                {/* paper size */}
                <div className="mb-4">
                  <p className="text-[11px] text-white/30 font-medium uppercase tracking-wider mb-2.5">Ukuran Kertas</p>
                  <div className="flex gap-2">
                    {(['a4', 'letter', 'f4'] as PaperSize[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => setPaperSize(size)}
                        className={`flex-1 h-9 text-xs font-medium rounded-lg transition-colors ${
                          paperSize === size
                            ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                            : 'bg-white/[0.04] text-white/30 border border-white/[0.06] hover:bg-white/[0.07] hover:text-white/50'
                        }`}
                      >
                        {PAPER_LABELS[size]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* quality */}
                <div>
                  <p className="text-[11px] text-white/30 font-medium uppercase tracking-wider mb-2.5">Kualitas</p>
                  <div className="flex gap-2">
                    {QUALITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setQuality(opt.value)}
                        className={`flex-1 h-9 rounded-lg transition-colors flex flex-col items-center justify-center ${
                          quality === opt.value
                            ? 'bg-red-600/20 border border-red-600/30'
                            : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07]'
                        }`}
                      >
                        <span className={`text-xs font-medium ${quality === opt.value ? 'text-red-400' : 'text-white/30'}`}>
                          {opt.label}
                        </span>
                        <span className="text-[10px] text-white/15">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}