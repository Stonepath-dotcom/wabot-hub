'use client'

import { useState, useRef, useCallback } from 'react'
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
}

interface PreviewPage {
  label: string
  preview: string
  isPdf: boolean
}

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

function imageToJpegBytes(dataUrl: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Canvas toBlob gagal')); return }
          blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf))).catch(reject)
        },
        'image/jpeg',
        0.92
      )
    }
    img.onerror = () => reject(new Error('Gambar tidak bisa dibaca'))
    img.src = dataUrl
  })
}

async function addImageToPdf(pdfDoc: PDFDocument, dataUrl: string) {
  const jpgBytes = await imageToJpegBytes(dataUrl)
  const image = await pdfDoc.embedJpg(jpgBytes)

  const page = pdfDoc.addPage([595, 842])
  const pw = 595
  const ph = 842
  const { width: iw, height: ih } = image.scale(1)

  const scale = Math.min(pw / iw, ph / ih)
  const drawW = iw * scale
  const drawH = ih * scale
  const x = (pw - drawW) / 2
  const y = (ph - drawH) / 2

  page.drawImage(image, { x, y, width: drawW, height: drawH })
}

/* ─── Main Component ────────────────────────────────── */

export default function Home() {
  const [uploads, setUploads] = useState<Record<string, UploadedFile>>({})
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [previewPages, setPreviewPages] = useState<PreviewPage[] | null>(null)
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const uploadedCount = Object.keys(uploads).length
  const requiredSlots = docSlots.filter((s) => s.required)
  const uploadedRequired = requiredSlots.filter((s) => uploads[s.id]).length

  /* ── Upload handlers ── */

  const handleFile = useCallback(async (slotId: string, file: File) => {
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic|heif|bmp|gif|tiff?)$/i.test(file.name)
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
    if (!isImage && !isPdf) return
    const dataUrl = await fileToDataUrl(file)
    const preview = URL.createObjectURL(file)
    setUploads((prev) => ({ ...prev, [slotId]: { file, preview, dataUrl } }))
    setError(null)
  }, [])

  const handleDrop = useCallback(
    (slotId: string, e: React.DragEvent) => {
      e.preventDefault()
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
            await addImageToPdf(pdfDoc, u.dataUrl)
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
  }, [uploads, uploadedCount])

  const handleDownloadFromPreview = useCallback(() => {
    if (!previewPdfUrl) return
    const a = document.createElement('a')
    a.href = previewPdfUrl
    a.download = 'Berkas_Lamaran_Kerja.pdf'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => document.body.removeChild(a), 500)
  }, [previewPdfUrl])

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

  /* ── Preview View ── */

  if (previewPages && previewPdfUrl) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        {/* top bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between sticky top-0 z-50">
          <button
            onClick={handleClosePreview}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </button>
          <span className="text-sm text-gray-500">
            {previewPages.length} halaman
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintFromPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={handleDownloadFromPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        {/* pages */}
        <main className="flex-1 p-4 sm:p-8 flex flex-col items-center gap-6">
          {previewPages.map((page, i) => (
            <div key={i} className="w-full max-w-[595px]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-gray-400 font-medium">{i + 1}</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">{page.label}</span>
              </div>
              <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">
                <div
                  className="w-full bg-white"
                  style={{ aspectRatio: '595 / 842' }}
                >
                  {page.isPdf ? (
                    <div className="w-full h-full flex items-center justify-center">
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

          {/* sticky bottom download */}
          <div className="sticky bottom-0 w-full max-w-[595px] bg-gradient-to-t from-gray-100 via-gray-100 to-transparent pt-8 pb-2">
            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-2 shadow-md">
              <button
                onClick={handleClosePreview}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDownloadFromPreview}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  /* ── Upload View ── */

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Berkas Lamaran Kerja</h1>
            <p className="text-xs text-gray-400 mt-0.5">Upload dokumen, cetak jadi PDF</p>
          </div>
          {uploadedCount > 0 && (
            <span className="text-xs text-gray-400">
              {uploadedRequired}/{requiredSlots.length} wajib · {uploadedCount} total
            </span>
          )}
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* error */}
          {error && (
            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          {/* upload slots */}
          <div className="space-y-2.5">
            {docSlots.map((slot) => {
              const uploaded = uploads[slot.id]
              const idx = docSlots.indexOf(slot)

              return (
                <div
                  key={slot.id}
                  className={`bg-white border rounded-lg overflow-hidden transition-colors ${
                    dragOver === slot.id
                      ? 'border-gray-400 bg-gray-50'
                      : uploaded
                        ? 'border-gray-300'
                        : 'border-gray-200'
                  }`}
                >
                  {/* slot header */}
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <span className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-800">
                        {slot.label}
                        {slot.required && <span className="text-red-400 ml-1">*</span>}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">{slot.desc}</span>
                    </span>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => handleMove(slot.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleMove(slot.id, 'down')}
                        disabled={idx === docSlots.length - 1}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* slot body */}
                  <div className="px-3 pb-3">
                    {uploaded ? (
                      <div className="relative group">
                        <div className="rounded-md overflow-hidden border border-gray-200 bg-gray-50">
                          <img
                            src={uploaded.preview}
                            alt={slot.label}
                            className="w-full h-40 sm:h-48 object-contain bg-white"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors rounded-md flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => handleReplace(slot.id)}
                            className="px-3 py-1.5 bg-white text-gray-800 rounded-md text-xs font-medium shadow hover:bg-gray-50 transition-colors"
                          >
                            Ganti
                          </button>
                          <button
                            onClick={() => handleRemove(slot.id)}
                            className="px-3 py-1.5 bg-white text-red-600 rounded-md text-xs font-medium shadow hover:bg-red-50 transition-colors"
                          >
                            <X className="w-3.5 h-3.5 inline mr-0.5" />
                            Hapus
                          </button>
                        </div>
                        <p className="mt-1 text-[11px] text-gray-400 truncate">
                          {uploaded.file.name} · {(uploaded.file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    ) : (
                      <div
                        className={`border border-dashed rounded-md p-5 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                          dragOver === slot.id
                            ? 'border-gray-400 bg-gray-50'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          const input = fileInputRefs.current[slot.id]
                          if (input) input.click()
                        }}
                        onDragOver={(e) => {
                          e.preventDefault()
                          setDragOver(slot.id)
                        }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={(e) => handleDrop(slot.id, e)}
                      >
                        <Upload className="w-5 h-5 text-gray-300 mb-1.5" />
                        <p className="text-xs text-gray-400">
                          Klik atau drag file ke sini
                        </p>
                        <p className="text-[11px] text-gray-300 mt-0.5">JPG, PNG, WebP, PDF</p>
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

      {/* bottom bar */}
      {uploadedCount > 0 && (
        <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-6 pb-3 -mx-4 px-4 sm:-mx-0 sm:px-0">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handlePreview}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
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
        </div>
      )}
    </div>
  )
}