'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  User,
  GraduationCap,
  CreditCard,
  FileCheck,
  BarChart3,
  ChevronRight,
  Printer,
  Download,
  ClipboardList
} from 'lucide-react'

/* ─── Data ──────────────────────────────────────────── */

const dataPribadi = {
  nama: 'JULIA',
  nik: '3215175807050003',
  tempatTglLahir: 'Karawang, 18 Juli 2005',
  jenisKelamin: 'Perempuan',
  golDarah: '-',
  alamat: 'Dusun Mekarsari',
  rtRw: '012/003',
  kelDesa: 'Talagamulya',
  kecamatan: 'Telagasari',
  kabupaten: 'Karawang',
  provinsi: 'Jawa Barat',
  agama: 'Islam',
  statusKawin: 'Belum Kawin',
  pekerjaan: 'Pelajar/Mahasiswa',
  kewarganegaraan: 'WNI',
  berlakuHingga: 'Seumur Hidup',
  noHp: '0858-9340-6103',
  email: 'zhuia2huia97@gmail.com',
}

const npwpData = {
  kpp: 'KPP Pratama Karawang',
  npwp: '20.301.468.3-408.000',
  npwp16: '3215 1758 0705 0003',
  nama: 'JULIA',
  alamat: 'Jalan Canc Mushola Nurul Ikhwan Blok. - No. 7, Talagamulya, Telagasari, Kab. Karawang, Jawa Barat',
  tanggalDaftar: '11/05/2024',
}

const lampiran = [
  'Pas Foto',
  'Daftar Riwayat Hidup',
  'Fotokopi KTP',
  'Fotokopi NPWP',
  'Fotokopi Ijazah',
  'Fotokopi SKCK',
  'Fotokopi Kartu Vaksin',
  'Fotokopi Sertifikat',
  'Fotokopi Kartu Keluarga',
  'Fotokopi Akta Kelahiran',
  'Fotokopi Surat Keterangan Sehat',
]

const riwayatPendidikan = [
  { no: 1, sekolah: 'PAUD Nurul Ikhwan', tahun: '2011 – 2013' },
  { no: 2, sekolah: 'SDN Talagamulya', tahun: '2013 – 2018' },
  { no: 3, sekolah: 'SMPN 1 Telagasari', tahun: '2018 – 2021' },
  { no: 4, sekolah: 'SMK PGRI Telagasari', tahun: '2021 – 2024' },
]

const pengalamanKerja = [
  {
    perusahaan: 'PT. Osimo Indonesia',
    bagian: 'Spacing LED',
    periode: '03 Februari 2025 – 26 Desember 2025',
  },
]

const ijazah = {
  kementerian: 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi',
  jenis: 'Ijazah Sekolah Menengah Kejuruan',
  program: 'Program 3 Tahun',
  tahunAjaran: '2023/2024',
  sekolah: 'SMK PGRI Telagasari',
  npsn: '20217795',
  kabKota: 'Karawang',
  provinsi: 'Jawa Barat',
  programKeahlian: 'Teknik Otomotif',
  konsentrasiKeahlian: 'Teknik Kendaraan Ringan',
  namaSiswa: 'JULIA',
  tglLahir: 'Karawang, 18 Juli 2005',
  namaOrtu: 'Uar',
  nis: '2122135138',
  nisn: '0059781242',
  status: 'LULUS',
  noSurat: '00B/SATDIK-SMK/11.03/SKL/1·2024',
  tglSurat: '6 Mei 2024',
  kepalaSekolah: 'H. Yan Yan Sopyanudin, ST, MM',
  tglTtd: '7 Mei 2024',
  noIjazah: 'M-SMK/KM-3/24/0074257',
}

const nilaiUmum = [
  { no: 1, mapel: 'Pendidikan Agama dan Budi Pekerti', nilai: 82.67 },
  { no: 2, mapel: 'Pendidikan Pancasila', nilai: 82.00 },
  { no: 3, mapel: 'Bahasa Indonesia', nilai: 84.00 },
  { no: 4, mapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', nilai: 83.50 },
  { no: 5, mapel: 'Sejarah', nilai: 78.00 },
  { no: 6, mapel: 'Seni Budaya', nilai: 81.00 },
  { no: 7, mapel: 'Muatan Lokal – Bahasa Sunda', nilai: 81.00 },
  { no: 8, mapel: 'Muatan Lokal – Bahasa Jepang', nilai: 78.50 },
]

const nilaiKejuruan = [
  { no: 1, mapel: 'Matematika', nilai: 82.00 },
  { no: 2, mapel: 'Bahasa Inggris', nilai: 81.00 },
  { no: 3, mapel: 'Informatika', nilai: 79.50 },
  { no: 4, mapel: 'Projek Ilmu Pengetahuan Alam dan Sosial', nilai: 80.75 },
  { no: 5, mapel: 'Dasar-dasar Program Keahlian', nilai: 81.25 },
  { no: 6, mapel: 'Konsentrasi Keahlian', nilai: 83.67 },
  { no: 7, mapel: 'Projek Kreatif dan Kewirausahaan', nilai: 84.25 },
  { no: 8, mapel: 'Praktik Kerja Lapangan', nilai: 83.20 },
  { no: 9, mapel: 'Mata Pelajaran Pilihan', nilai: 81.50 },
]

const rataRata = 81.99

/* ─── Components ─────────────────────────────────────── */

function PDFPage({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-sm shadow-lg border border-neutral-200/60 ${className}`}
      style={{ fontFamily: "'Times New Roman', 'Noto Serif', serif" }}
    >
      {children}
    </div>
  )
}

function DataRow({ label, value, colon = true }: { label: string; value: string; colon?: boolean }) {
  return (
    <div className="flex items-baseline py-[3px]">
      <span className="text-[13px] text-neutral-700 shrink-0 w-[200px]">
        {label}{colon ? ' : ' : ' '}
      </span>
      <span className="text-[13px] text-neutral-900 font-medium">
        {value}
      </span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mt-4 mb-2">
      <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
      <span className="text-[13px] font-bold text-neutral-800 uppercase tracking-wide">
        {children}
      </span>
    </div>
  )
}

function DottedLine() {
  return <div className="border-b border-dotted border-neutral-300 my-1" />
}

/* ─── Page: Surat Lamaran ───────────────────────────── */

function SuratLamaranPage() {
  return (
    <PDFPage className="p-10 sm:p-14 max-w-[210mm] mx-auto">
      <div className="space-y-1 text-right text-[13px] text-neutral-700">
        <p className="font-medium">Karawang, 30 Januari 2026</p>
      </div>

      <div className="mt-6 space-y-1 text-[13px] text-neutral-700">
        <p className="font-bold text-neutral-900">Hal : Lamaran Pekerjaan</p>
        <p className="font-bold text-neutral-900">Lampiran : Satu berkas</p>
      </div>

      <div className="mt-6 text-[13px] text-neutral-700">
        <p>Yth. Pimpinan HRD</p>
        <p>di tempat</p>
      </div>

      <div className="mt-6 text-[13px] text-neutral-700 leading-relaxed">
        <p>Dengan hormat, yang bertanda tangan di bawah ini:</p>
      </div>

      <div className="mt-4 ml-4 space-y-[2px]">
        <DataRow label="Nama" value={dataPribadi.nama} />
        <DataRow label="Tempat, Tanggal Lahir" value={dataPribadi.tempatTglLahir} />
        <DataRow label="Pendidikan Akhir" value="SMK (Sekolah Menengah Kejuruan)" />
        <DataRow label="Alamat" value={`${dataPribadi.alamat}, Rt. ${dataPribadi.rtRw}, Desa ${dataPribadi.kelDesa}, Kec. ${dataPribadi.kecamatan}, Kab. ${dataPribadi.kabupaten}`} />
        <DataRow label="No. HP" value={dataPribadi.noHp} />
        <DataRow label="Email" value={dataPribadi.email} />
      </div>

      <div className="mt-6 text-[13px] text-neutral-700 leading-relaxed">
        <p>
          Dengan ini mengajukan lamaran pekerjaan di perusahaan yang Bapak/Ibu pimpin.
          Sebagai bahan pertimbangan, bersama ini saya lampirkan:
        </p>
      </div>

      <div className="mt-4 ml-4 space-y-[2px]">
        {lampiran.map((item, i) => (
          <div key={i} className="flex items-baseline py-[1px]">
            <span className="text-[13px] text-neutral-700 w-[24px] shrink-0">{i + 1}.</span>
            <span className="text-[13px] text-neutral-700">{item}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 text-[13px] text-neutral-700 leading-relaxed">
        <p>
          Demikian surat lamaran ini saya buat dengan sebenar-benarnya. Atas perhatian dan
          pertimbangan Bapak/Ibu, saya mengucapkan terima kasih.
        </p>
      </div>

      <div className="mt-10 text-right">
        <p className="text-[13px] text-neutral-700">Hormat saya,</p>
        <div className="mt-16 flex justify-center">
          <p className="text-[13px] text-neutral-700 font-medium">( Julia )</p>
        </div>
      </div>
    </PDFPage>
  )
}

/* ─── Page: Daftar Riwayat Hidup ────────────────────── */

function RiwayatHidupPage() {
  return (
    <PDFPage className="p-10 sm:p-14 max-w-[210mm] mx-auto">
      <h2 className="text-center text-[15px] font-bold text-neutral-900 uppercase tracking-wider">
        Daftar Riwayat Hidup
      </h2>
      <Separator className="mt-2 mb-4" />

      <div className="space-y-[2px]">
        <DataRow label="Nama" value={dataPribadi.nama} />
        <DataRow label="Tempat, Tanggal Lahir" value={dataPribadi.tempatTglLahir} />
        <DataRow label="Jenis Kelamin" value={dataPribadi.jenisKelamin} />
        <DataRow label="Agama" value={dataPribadi.agama} />
        <DataRow label="Kewarganegaraan" value={dataPribadi.kewarganegaraan} />
        <DataRow label="Status" value="Lajang" />
        <DataRow label="Alamat" value={`${dataPribadi.alamat}, Rt/Rw ${dataPribadi.rtRw}, Desa ${dataPribadi.kelDesa}, Kec. ${dataPribadi.kecamatan}, Kab. ${dataPribadi.kabupaten}`} />
        <DataRow label="No. Handphone" value={dataPribadi.noHp} />
      </div>

      <p className="mt-6 text-[13px] text-neutral-700 italic">
        Menerangkan dengan sebenarnya:
      </p>

      <SectionTitle>Riwayat Pendidikan</SectionTitle>
      <div className="space-y-[2px] ml-4">
        {riwayatPendidikan.map((r) => (
          <div key={r.no} className="flex items-baseline py-[1px]">
            <span className="text-[13px] text-neutral-700 w-[24px] shrink-0">{r.no}.</span>
            <span className="text-[13px] text-neutral-700">
              {r.sekolah}{' '}
              <span className="text-neutral-500">{r.tahun}</span>
            </span>
          </div>
        ))}
      </div>

      <SectionTitle>Pengalaman Kerja</SectionTitle>
      {pengalamanKerja.map((p, i) => (
        <div key={i} className="ml-4 space-y-[2px]">
          <div className="flex items-baseline py-[1px]">
            <span className="text-[13px] text-neutral-700">
              <span className="font-medium">{p.perusahaan}</span>, bagian {p.bagian}
            </span>
          </div>
          <div className="flex items-baseline py-[1px] ml-4">
            <span className="text-[13px] text-neutral-500">Periode {p.periode}</span>
          </div>
        </div>
      ))}

      <div className="mt-10 text-[13px] text-neutral-700 leading-relaxed">
        <p>Demikian daftar riwayat hidup ini saya buat dengan sebenar-benarnya.</p>
      </div>

      <div className="mt-6 flex justify-between">
        <div>
          <p className="text-[13px] text-neutral-700">Saya yang bersangkutan,</p>
          <div className="mt-16 flex justify-center">
            <p className="text-[13px] text-neutral-700 font-medium">( Julia )</p>
          </div>
        </div>
      </div>
    </PDFPage>
  )
}

/* ─── Page: KTP ─────────────────────────────────────── */

function KTPPage() {
  return (
    <PDFPage className="p-10 sm:p-14 max-w-[210mm] mx-auto">
      <div className="border-2 border-blue-700 rounded-md p-6 bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center mb-4">
          <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
            Provinsi Jawa Barat
          </p>
          <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
            Kabupaten Karawang
          </p>
        </div>

        <Separator className="my-3 bg-blue-200" />

        <div className="space-y-[3px]">
          <DataRow label="NIK" value={dataPribadi.nik} />
          <DataRow label="Nama" value={dataPribadi.nama} />
          <DataRow label="Tempat/Tgl Lahir" value={dataPribadi.tempatTglLahir} />
          <div className="flex items-baseline py-[3px]">
            <span className="text-[13px] text-neutral-700 shrink-0 w-[200px]">Jenis Kelamin : </span>
            <span className="text-[13px] text-neutral-900 font-medium">{dataPribadi.jenisKelamin}</span>
            <span className="text-[13px] text-neutral-500 ml-4">Gol. Darah : {dataPribadi.golDarah}</span>
          </div>
          <DataRow label="Alamat" value={dataPribadi.alamat} />
          <DataRow label="RT/RW" value={dataPribadi.rtRw} />
          <DataRow label="Kel/Desa" value={dataPribadi.kelDesa} />
          <DataRow label="Kecamatan" value={dataPribadi.kecamatan} />
          <DataRow label="Agama" value={dataPribadi.agama} />
          <DataRow label="Status Perkawinan" value={dataPribadi.statusKawin} />
          <DataRow label="Pekerjaan" value={dataPribadi.pekerjaan} />
          <DataRow label="Kewarganegaraan" value={dataPribadi.kewarganegaraan} />
          <DataRow label="Berlaku Hingga" value={dataPribadi.berlakuHingga} />
        </div>

        <Separator className="my-3 bg-blue-200" />

        <div className="text-center mt-4">
          <p className="text-[11px] text-neutral-500">{dataPribadi.kabupaten.toUpperCase()}</p>
          <p className="text-[11px] text-neutral-500">24-08-2023</p>
        </div>
      </div>
    </PDFPage>
  )
}

/* ─── Page: NPWP ────────────────────────────────────── */

function NPWPPage() {
  return (
    <PDFPage className="p-10 sm:p-14 max-w-[210mm] mx-auto">
      <div className="border-2 border-emerald-600 rounded-md p-6 bg-gradient-to-br from-emerald-50 to-white">
        <div className="text-center mb-2">
          <p className="text-[18px] font-bold text-emerald-800 tracking-wider">NPWP</p>
        </div>

        <Separator className="my-3 bg-emerald-200" />

        <div className="space-y-[3px]">
          <div className="flex items-baseline py-[3px]">
            <span className="text-[13px] text-neutral-700 shrink-0 w-[200px]">KPP : </span>
            <span className="text-[13px] text-neutral-900 font-medium">{npwpData.kpp}</span>
          </div>
          <DataRow label="NPWP" value={npwpData.npwp} />
          <DataRow label="Nama" value={npwpData.nama} />
          <DataRow label="NPWP 16 Digit" value={npwpData.npwp16} />
          <DataRow label="Alamat" value={npwpData.alamat} />
          <DataRow label="Tanggal Terdaftar" value={npwpData.tanggalDaftar} />
        </div>

        <Separator className="my-3 bg-emerald-200" />

        <div className="flex justify-end mt-4">
          <p className="text-[11px] text-neutral-400 italic">DJP – Direktorat Jenderal Pajak</p>
        </div>
      </div>
    </PDFPage>
  )
}

/* ─── Page: Ijazah ──────────────────────────────────── */

function IjazahPage() {
  return (
    <PDFPage className="p-10 sm:p-14 max-w-[210mm] mx-auto">
      <div className="text-center space-y-1 mb-2">
        <p className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
          {ijazah.kementerian.toUpperCase()}
        </p>
        <p className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
          Republik Indonesia
        </p>
      </div>

      <div className="text-center mt-4 mb-2">
        <p className="text-[22px] font-bold text-neutral-900 uppercase tracking-widest">
          {ijazah.jenis.toUpperCase()}
        </p>
        <p className="text-[13px] font-medium text-neutral-600 mt-1">{ijazah.program}</p>
        <p className="text-[13px] font-medium text-neutral-600">Tahun Ajaran {ijazah.tahunAjaran}</p>
      </div>

      <Separator className="my-4" />

      <div className="text-[13px] text-neutral-700 leading-relaxed">
        <p className="mb-3">
          Yang bertanda tangan di bawah ini, Kepala <span className="font-medium">{ijazah.sekolah}</span>,
          menerangkan bahwa:
        </p>
      </div>

      <div className="ml-4 space-y-[3px]">
        <DataRow label="Nama" value={ijazah.namaSiswa} />
        <DataRow label="Tempat dan Tanggal Lahir" value={ijazah.tglLahir} />
        <DataRow label="Nama Orang Tua/Wali" value={ijazah.namaOrtu} />
        <DataRow label="Nomor Induk Siswa" value={ijazah.nis} />
        <DataRow label="Nomor Induk Siswa Nasional" value={ijazah.nisn} />
      </div>

      <Separator className="my-4" />

      <div className="ml-4 space-y-[3px]">
        <DataRow label="Program Keahlian" value={ijazah.programKeahlian} />
        <DataRow label="Konsentrasi Keahlian" value={ijazah.konsentrasiKeahlian} />
      </div>

      <div className="text-center my-6">
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-[13px] px-6 py-1">
          {ijazah.status}
        </Badge>
      </div>

      <div className="text-[13px] text-neutral-700 leading-relaxed">
        <p>
          Berdasarkan keputusan Kepala {ijazah.sekolah} Nomor: {ijazah.noSurat},
          tanggal {ijazah.tglSurat}.
        </p>
      </div>

      <div className="mt-8 space-y-[3px]">
        <DataRow label="NPSN" value={ijazah.npsn} />
        <DataRow label="Kabupaten/Kota" value={ijazah.kabKota} />
        <DataRow label="Provinsi" value={ijazah.provinsi} />
      </div>

      <div className="mt-8 text-right">
        <p className="text-[13px] text-neutral-700">Kab. {ijazah.kabKota}, {ijazah.tglTtd}</p>
        <p className="text-[13px] text-neutral-700">Kepala Sekolah,</p>
        <div className="mt-16 flex justify-center">
          <p className="text-[13px] text-neutral-700 font-medium">{ijazah.kepalaSekolah}</p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-[11px] text-neutral-400">{ijazah.noIjazah}</p>
      </div>
    </PDFPage>
  )
}

/* ─── Page: Daftar Nilai ────────────────────────────── */

function DaftarNilaiPage() {
  return (
    <PDFPage className="p-10 sm:p-14 max-w-[210mm] mx-auto">
      <div className="text-center space-y-1 mb-2">
        <p className="text-[18px] font-bold text-neutral-900 uppercase tracking-widest">
          Daftar Nilai
        </p>
        <p className="text-[12px] font-medium text-neutral-600 uppercase tracking-wider">
          Sekolah Menengah Kejuruan
        </p>
        <p className="text-[12px] text-neutral-500">
          Tahun Ajaran {ijazah.tahunAjaran}
        </p>
      </div>

      <Separator className="my-4" />

      <div className="space-y-[3px] mb-6">
        <DataRow label="Nama" value={ijazah.namaSiswa} />
        <DataRow label="Tempat dan Tanggal Lahir" value={ijazah.tglLahir} />
        <DataRow label="NIS" value={ijazah.nis} />
        <DataRow label="NISN" value={ijazah.nisn} />
        <DataRow label="Konsentrasi Keahlian" value={ijazah.konsentrasiKeahlian} />
      </div>

      {/* Table: Nilai Umum */}
      <SectionTitle>
        A. Kelompok Mata Pelajaran Umum
      </SectionTitle>
      <div className="border border-neutral-300 rounded-sm overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-neutral-100 border-b border-neutral-300">
              <th className="text-left py-2 px-3 w-[40px] font-semibold text-neutral-700">No</th>
              <th className="text-left py-2 px-3 font-semibold text-neutral-700">Mata Pelajaran</th>
              <th className="text-right py-2 px-3 w-[80px] font-semibold text-neutral-700">Nilai</th>
            </tr>
          </thead>
          <tbody>
            {nilaiUmum.map((n) => (
              <tr key={n.no} className="border-b border-neutral-100 last:border-b-0">
                <td className="py-[5px] px-3 text-neutral-500">{n.no}</td>
                <td className="py-[5px] px-3 text-neutral-800">{n.mapel}</td>
                <td className="py-[5px] px-3 text-right text-neutral-900 font-medium">
                  {n.nilai.toFixed(2).replace('.', ',')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table: Nilai Kejuruan */}
      <SectionTitle>
        B. Kelompok Mata Pelajaran Kejuruan
      </SectionTitle>
      <div className="border border-neutral-300 rounded-sm overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-neutral-100 border-b border-neutral-300">
              <th className="text-left py-2 px-3 w-[40px] font-semibold text-neutral-700">No</th>
              <th className="text-left py-2 px-3 font-semibold text-neutral-700">Mata Pelajaran</th>
              <th className="text-right py-2 px-3 w-[80px] font-semibold text-neutral-700">Nilai</th>
            </tr>
          </thead>
          <tbody>
            {nilaiKejuruan.map((n) => (
              <tr key={n.no} className="border-b border-neutral-100 last:border-b-0">
                <td className="py-[5px] px-3 text-neutral-500">{n.no}</td>
                <td className="py-[5px] px-3 text-neutral-800">{n.mapel}</td>
                <td className="py-[5px] px-3 text-right text-neutral-900 font-medium">
                  {n.nilai.toFixed(2).replace('.', ',')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rata-rata */}
      <div className="flex justify-end mt-4">
        <div className="flex items-center gap-3 bg-neutral-100 px-4 py-2 rounded-sm border border-neutral-200">
          <span className="text-[13px] font-semibold text-neutral-700">Rata-rata</span>
          <span className="text-[15px] font-bold text-neutral-900">
            {rataRata.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>

      <div className="mt-8 text-right">
        <p className="text-[13px] text-neutral-700">7 Mei 2024</p>
        <p className="text-[13px] text-neutral-700">Kepala Sekolah,</p>
        <div className="mt-16 flex justify-center">
          <p className="text-[13px] text-neutral-700 font-medium">{ijazah.kepalaSekolah}</p>
        </div>
      </div>
    </PDFPage>
  )
}

/* ─── Page: Lampiran Checklist ──────────────────────── */

function LampiranPage() {
  return (
    <PDFPage className="p-10 sm:p-14 max-w-[210mm] mx-auto">
      <h2 className="text-center text-[15px] font-bold text-neutral-900 uppercase tracking-wider">
        Daftar Lampiran
      </h2>
      <p className="text-center text-[12px] text-neutral-500 mt-1">
        Kelengkapan Berkas Lamaran Pekerjaan
      </p>
      <Separator className="mt-4 mb-6" />

      <div className="space-y-[2px]">
        {lampiran.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-[6px] px-3 rounded-sm hover:bg-neutral-50 transition-colors"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 text-[11px] font-semibold text-neutral-600 shrink-0">
              {i + 1}
            </span>
            <span className="text-[13px] text-neutral-800">{item}</span>
            <span className="ml-auto">
              <FileCheck className="w-4 h-4 text-emerald-500" />
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-sm">
        <p className="text-[12px] text-amber-800">
          <span className="font-semibold">Catatan:</span> Semua dokumen dilampirkan dalam satu berkas sebagai bahan pertimbangan.
        </p>
      </div>
    </PDFPage>
  )
}

/* ─── Main Page ─────────────────────────────────────── */

const pages = [
  { id: 'surat', label: 'Surat Lamaran', icon: FileText },
  { id: 'riwayat', label: 'Riwayat Hidup', icon: ClipboardList },
  { id: 'ktp', label: 'KTP', icon: CreditCard },
  { id: 'npwp', label: 'NPWP', icon: CreditCard },
  { id: 'ijazah', label: 'Ijazah', icon: GraduationCap },
  { id: 'nilai', label: 'Daftar Nilai', icon: BarChart3 },
  { id: 'lampiran', label: 'Lampiran', icon: FileCheck },
] as const

type PageId = (typeof pages)[number]['id']

export default function Home() {
  const [activePage, setActivePage] = useState<PageId>('surat')

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Times New Roman', 'Noto Serif', serif" }}>
      {/* Top Bar */}
      <header className="bg-neutral-800 text-white px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-white/10">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[13px] font-semibold">Berkas Lamaran Kerja</p>
            <p className="text-[11px] text-neutral-400">{dataPribadi.nama} – {dataPribadi.kabupaten}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-neutral-500 text-neutral-300 text-[11px]">
            {pages.length} Halaman
          </Badge>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white/10 hover:bg-white/20 transition-colors text-[12px]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-56 bg-neutral-50 border-r border-neutral-200 p-3 space-y-1 hidden lg:block print:hidden shrink-0 sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto">
          <div className="px-2 mb-3">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Daftar Isi</p>
          </div>
          {pages.map((p) => {
            const Icon = p.icon
            const isActive = activePage === p.id
            return (
              <button
                key={p.id}
                onClick={() => setActivePage(p.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-[13px] transition-colors text-left ${
                  isActive
                    ? 'bg-white text-neutral-900 shadow-sm font-medium border border-neutral-200'
                    : 'text-neutral-600 hover:bg-white/60 hover:text-neutral-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {p.label}
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <main className="flex-1 bg-neutral-200/40 p-4 sm:p-8 overflow-y-auto">
          {/* Mobile tabs */}
          <div className="lg:hidden mb-6 print:hidden overflow-x-auto">
            <div className="flex gap-1.5 min-w-max pb-1">
              {pages.map((p) => {
                const Icon = p.icon
                const isActive = activePage === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePage(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12px] transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-neutral-800 text-white font-medium'
                        : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* PDF Pages */}
          <div className="print:p-0 print:bg-white print:shadow-none print:border-none">
            {activePage === 'surat' && <SuratLamaranPage />}
            {activePage === 'riwayat' && <RiwayatHidupPage />}
            {activePage === 'ktp' && <KTPPage />}
            {activePage === 'npwp' && <NPWPPage />}
            {activePage === 'ijazah' && <IjazahPage />}
            {activePage === 'nilai' && <DaftarNilaiPage />}
            {activePage === 'lampiran' && <LampiranPage />}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-neutral-800 text-neutral-400 px-4 py-2 text-center text-[11px] print:hidden">
        Berkas Lamaran Pekerjaan – {dataPribadi.nama} – {dataPribadi.tempatTglLahir}
      </footer>
    </div>
  )
}