'use client'

import { useState, useRef, useCallback } from 'react'
import { PDFDocument } from 'pdf-lib'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Upload,
  X,
  FileText,
  User,
  GraduationCap,
  CreditCard,
  FileCheck,
  BarChart3,
  ClipboardList,
  Camera,
  Download,
  RotateCcw,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────── */

interface DocSlot {
  id: string
  label: string
  icon: React.ElementType
  description: string
  required: boolean
}

interface UploadedFile {
  file: File
  preview: string
  dataUrl: string
}

/* ─── Document Slots ────────────────────────────────── */

const docSlots: DocSlot[] = [
  { id: 'pas_foto', label: 'Pas Foto', icon: Camera, description: 'Foto 3x4 atau 4x6', required: false },
  { id: 'surat_lamaran', label: 'Surat Lamaran', icon: FileText, description: 'Surat lamaran pekerjaan', required: true },
  { id: 'riwayat_hidup', label: 'Daftar Riwayat Hidup', icon: ClipboardList, description: 'CV / riwayat hidup', required: true },
  { id: 'ktp', label: 'Fotokopi KTP', icon: CreditCard, description: 'Kartu Tanda Penduduk', required: true },
  { id: 'npwp', label: 'Fotokopi NPWP', icon: CreditCard, description: 'Nomor Pokok Wajib Pajak', required: false },
  { id: 'ijazah', label: 'Fotokopi Ijazah', icon: GraduationCap, description: 'Ijazah terakhir', required: true },
  { id: 'skck', label: 'Fotokopi SKCK', icon: FileCheck, description: 'Surat Keterangan Catatan Kepolisian', required: false },
  { id: 'kartu_vaksin', label: 'Fotokopi Kartu Vaksin', icon: FileCheck, description: 'Kartu vaksinasi', required: false },
  { id: 'sertifikat', label: 'Fotokopi Sertifikat', icon: FileCheck, description: 'Sertifikat pendukung', required: false },
  { id: 'kartu_keluarga', label: 'Fotokopi Kartu Keluarga', icon: User, description: 'KK', required: true },
  { id: 'akta_lahir', label: 'Fotokopi Akta Kelahiran', icon: FileText, description: 'Akta lahir', required: false },
  { id: 'sk_sehat', label: 'Surat Keterangan Sehat', icon: FileCheck, description: 'Dokumen kesehatan', required: false },
  { id: 'daftar_nilai', label: 'Daftar Nilai', icon: BarChart3, description: 'Transkrip / rapor', required: false },
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

function embedImage(pdfDoc: PDFDocument, dataUrl: string, pageIndex: number) {
  const bytes = atob(dataUrl.split(',')[1])
  const uint8 = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) uint8[i] = bytes.charCodeAt(i)

  let image: ReturnType<PDFDocument['embedJpg']> | ReturnType<PDFDocument['embedPng']>
  const mime = dataUrl.split(';')[0].split(':')[1]

  if (mime === 'image/png') {
    image = pdfDoc.embedPng(uint8)
  } else if (mime === 'image/jpeg' || mime === 'image/jpg') {
    image = pdfDoc.embedJpg(uint8)
  } else {
    // Convert to PNG via canvas
    return null
  }

  const page = pdfDoc.addPage([595, 842]) // A4
  const { width: pw, height: ph } = page.getSize()
  const { width: iw, height: ih } = image.scale(1)

  const scale = Math.min(pw / iw, ph / ih)
  const drawW = iw * scale
  const drawH = ih * scale
  const x = (pw - drawW) / 2
  const y = (ph - drawH) / 2

  page.drawImage(image, { x, y, width: drawW, height: drawH })
  return true
}

/* ─── Main Component ────────────────────────────────── */

export default function Home() {
  const [uploads, setUploads] = useState<Record<string, UploadedFile>>({})
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const uploadedCount = Object.keys(uploads).length
  const requiredSlots = docSlots.filter((s) => s.required)
  const uploadedRequired = requiredSlots.filter((s) => uploads[s.id]).length
  const allRequiredDone = uploadedRequired === requiredSlots.length

  /* ── Upload handlers ── */

  const handleFile = useCallback(async (slotId: string, file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') return
    const dataUrl = await fileToDataUrl(file)
    const preview = URL.createObjectURL(file)
    setUploads((prev) => ({ ...prev, [slotId]: { file, preview, dataUrl } }))
    setMessage(null)
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
    setMessage(null)
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
    setMessage(null)
    setProgress(0)
  }, [uploads])

  /* ── Move up / down ── */

  const handleMove = useCallback(
    (slotId: string, dir: 'up' | 'down') => {
      const ids = docSlots.map((s) => s.id)
      const idx = ids.indexOf(slotId)
      if (dir === 'up' && idx <= 0) return
      if (dir === 'down' && idx >= ids.length - 1) return

      // We need to also swap the uploads
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

  /* ── Generate PDF ── */

  const handleGeneratePDF = useCallback(async () => {
    if (uploadedCount === 0) {
      setMessage({ type: 'error', text: 'Upload minimal 1 dokumen dulu!' })
      return
    }

    setGenerating(true)
    setProgress(0)
    setMessage(null)

    try {
      const pdfDoc = await PDFDocument.create()
      const orderedSlots = docSlots.filter((s) => uploads[s.id])
      let done = 0

      for (const slot of orderedSlots) {
        const u = uploads[slot.id]
        if (u) {
          const mime = u.dataUrl.split(';')[0].split(':')[1]

          if (mime === 'image/png' || mime === 'image/jpeg' || mime === 'image/jpg') {
            embedImage(pdfDoc, u.dataUrl, done)
          } else if (mime === 'application/pdf') {
            // Merge PDF page
            try {
              const bytes = atob(u.dataUrl.split(',')[1])
              const uint8 = new Uint8Array(bytes.length)
              for (let i = 0; i < bytes.length; i++) uint8[i] = bytes.charCodeAt(i)
              const srcDoc = await PDFDocument.load(uint8)
              const pages = await pdfDoc.copyPages(srcDoc, srcDoc.getPageIndices())
              pages.forEach((p) => pdfDoc.addPage(p))
            } catch {
              // fallback: skip
            }
          }
          done++
          setProgress(Math.round((done / orderedSlots.length) * 100))
        }
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = 'Berkas_Lamaran_Kerja.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setMessage({
        type: 'success',
        text: `PDF berhasil dibuat! ${done} halaman dari ${orderedSlots.length} dokumen.`,
      })
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Gagal membuat PDF. Coba lagi.' })
    } finally {
      setGenerating(false)
    }
  }, [uploads, uploadedCount])

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      {/* Header */}
      <header className="bg-neutral-800 text-white px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[14px] font-semibold">Buat Berkas Lamaran Kerja</p>
            <p className="text-[11px] text-neutral-400">Upload foto dokumen, cetak jadi PDF</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-neutral-500 text-neutral-300 text-[11px]">
            {uploadedCount}/{docSlots.length} dokumen
          </Badge>
          {uploadedRequired === requiredSlots.length && (
            <Badge className="bg-emerald-600 text-white text-[11px] hover:bg-emerald-600">
              <Check className="w-3 h-3 mr-1" />
              Lengkap
            </Badge>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full">
          {/* Message */}
          {message && (
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-4 text-[13px] ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              {message.text}
            </div>
          )}

          {/* Info Card */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-neutral-800">Cara Pakai</p>
                <ol className="mt-1.5 space-y-1 text-[13px] text-neutral-600 list-decimal list-inside">
                  <li>Upload foto/foto setiap dokumen ke slot yang sesuai</li>
                  <li>Urutkan dokumen dengan tombol panah atas/bawah</li>
                  <li>Klik <span className="font-semibold text-neutral-800">&quot;Cetak PDF&quot;</span> untuk download file PDF</li>
                  <li>PDF berisi semua halaman sesuai urutan yang lo tentuin</li>
                </ol>
                <p className="mt-2 text-[12px] text-neutral-400">
                  Mendukung format: JPG, PNG, PDF
                </p>
              </div>
            </div>
          </div>

          {/* Upload Slots */}
          <div className="space-y-3">
            {docSlots.map((slot) => {
              const Icon = slot.icon
              const uploaded = uploads[slot.id]
              const idx = docSlots.indexOf(slot)

              return (
                <div
                  key={slot.id}
                  className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-colors ${
                    dragOver === slot.id
                      ? 'border-blue-400 bg-blue-50/50'
                      : uploaded
                        ? 'border-emerald-200'
                        : 'border-neutral-200'
                  }`}
                >
                  {/* Slot Header */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <GripVertical className="w-4 h-4 text-neutral-300 shrink-0" />
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-neutral-800 truncate">
                          {slot.label}
                        </p>
                        {slot.required && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-medium shrink-0">
                            WAJIB
                          </span>
                        )}
                        {uploaded && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600 font-medium shrink-0">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400">{slot.description}</p>
                    </div>

                    {/* Order buttons */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        onClick={() => handleMove(slot.id, 'up')}
                        disabled={idx === 0}
                        className="p-0.5 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Pindah ke atas"
                      >
                        <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
                      </button>
                      <button
                        onClick={() => handleMove(slot.id, 'down')}
                        disabled={idx === docSlots.length - 1}
                        className="p-0.5 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Pindah ke bawah"
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                      </button>
                    </div>
                  </div>

                  {/* Upload Area / Preview */}
                  <div className="px-4 pb-3">
                    {uploaded ? (
                      <div className="relative group">
                        <div className="rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50">
                          <img
                            src={uploaded.preview}
                            alt={slot.label}
                            className="w-full h-40 sm:h-52 object-contain bg-white"
                          />
                        </div>
                        {/* Overlay buttons */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => handleReplace(slot.id)}
                            className="px-3 py-1.5 bg-white text-neutral-800 rounded-lg text-[12px] font-medium shadow-md hover:bg-neutral-50 transition-colors"
                          >
                            Ganti
                          </button>
                          <button
                            onClick={() => handleRemove(slot.id)}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[12px] font-medium shadow-md hover:bg-red-600 transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                        <p className="mt-1.5 text-[11px] text-neutral-400 truncate">
                          {uploaded.file.name} ({(uploaded.file.size / 1024).toFixed(0)} KB)
                        </p>
                      </div>
                    ) : (
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                          dragOver === slot.id
                            ? 'border-blue-400 bg-blue-50/50'
                            : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
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
                        <Upload className="w-6 h-6 text-neutral-300 mb-2" />
                        <p className="text-[12px] text-neutral-500 text-center">
                          Klik atau drag foto ke sini
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-1">JPG, PNG, atau PDF</p>
                      </div>
                    )}
                  </div>

                  {/* Hidden file input */}
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

          {/* Bottom Actions */}
          <div className="sticky bottom-0 bg-gradient-to-t from-neutral-100 via-neutral-100 to-transparent pt-6 pb-2 mt-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex items-center gap-3 bg-white rounded-xl border border-neutral-200 p-3 shadow-lg">
              {uploadedCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetAll}
                  className="text-neutral-500 hover:text-red-600 shrink-0"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Reset
                </Button>
              )}
              <Button
                onClick={handleGeneratePDF}
                disabled={generating || uploadedCount === 0}
                className="flex-1 bg-neutral-800 hover:bg-neutral-900 text-white font-semibold"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Membuat PDF... {progress}%
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Cetak PDF
                    {uploadedCount > 0 && (
                      <span className="ml-2 text-[11px] opacity-70">
                        ({uploadedCount} dokumen)
                      </span>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Spacer for sticky bottom */}
          <div className="h-4" />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-neutral-800 text-neutral-400 px-4 py-2 text-center text-[11px]">
        Berkas Lamaran Kerja — Upload foto dokumen, cetak jadi PDF
      </footer>
    </div>
  )
}