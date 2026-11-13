# JobTrack — Private Single-User Job Application Tracker

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![React](https://img.shields.io/badge/React-19.3-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Tests-Vitest%20Passed-brightgreen.svg)](src/test)

**JobTrack** adalah aplikasi pelacak lamaran pekerjaan pribadi (*single-user*) yang dirancang khusus untuk memonitor progres rekrutmen, jadwal wawancara, catatan evaluasi, berkas dokumen, serta performa pencarian kerja secara terpusat, modern, dan aman berbasis **Supabase**.

---

## 🚀 Apa yang Baru di Versi 1.0.0

- **Sumber Lowongan Terstandarisasi**: Input sumber lowongan kini berupa dropdown pilihan umum (*LinkedIn, Glints, Jobstreet, Indeed, Kalibrr, Tech in Asia, Website Perusahaan / Karir, Referral / Rekomendasi*) serta opsi *Lainnya (Other)* dengan input teks bebas.
- **Catatan Awal Lamaran & Edit Inline**: Catatan tambahan yang dibuat saat pengisian formulir kini ditampilkan rapi di bagian atas tab *Catatan Aktivitas* pada halaman Detail Lamaran, lengkap dengan kapabilitas edit langsung (*inline save/cancel*) ke database.
- **Penyematan Cepat Berkas (*Paste on Hover*)**: Cukup arahkan kursor mouse ke kotak *Dokumen & Lampiran* lalu tekan `Ctrl+V` untuk menempelkan berkas atau hasil tangkapan layar (*screenshot*) clipboard secara instan:
  - Berkas tangkapan layar/clipboard otomatis dinamai berurutan per hari: `dt_YYYYMMDD_0001.<ext>`.
  - Berkas fisik dari File Explorer tetap mempertahankan nama aslinya.
- **Strict TDD & ISTQB Test Suites**: 35 pengujian unit otomatis mencakup validasi berkas, penomoran urut lampiran, autentikasi, serta kalkulasi metrik.

---

## 🌟 Fitur Utama

- **Single-User Security & Authorization**: Menggunakan tabel `app_owner` dan PostgreSQL Row Level Security (RLS) serta helper function `is_app_owner()` untuk memastikan hanya satu pemilik sah yang memiliki izin baca dan tulis data. Pendaftaran publik dinonaktifkan secara permanen.
- **Modern Linear/Notion-Inspired UI**: Desain minimalis beraksen ungu/violet elegan, mendukung mode Gelap (*Dark*) dan Terang (*Light*), serta sepenuhnya responsif untuk perangkat desktop maupun seluler.
- **Executive Dashboard**: Ringkasan metrik utama (*Total Applications, Active, Waiting for Interview, Offers*), widget agenda wawancara terdekat, pengukur momentum lamaran, dan tabel aktivitas lamaran terkini.
- **Job Applications Management**: Manajemen lamaran lengkap (CRUD) dengan pencarian cerdas, filter status, prioritas, sumber lowongan, tanggal melamar, paginasi, dan ekspor data ke format CSV.
- **Recruitment Kanban Pipeline**: Pipeline visual *drag-and-drop* interaktif yang mencakup 12 tahapan rekrutmen (*Saved, Applied, Screening, HR Interview, Technical Test, User Interview, Final Interview, Offering, Accepted, Rejected, Withdrawn, No Response*) tersinkronisasi instan ke Supabase.
- **Detail Lamaran & Riwayat Lengkap**: Informasi detail kompensasi gaji, kontak rekruter, tautan lowongan, catatan evaluasi wawancara, serta riwayat linimasa perubahan status (*audit trail*).
- **Interview & Event Calendar**: Penjadwalan terstruktur untuk wawancara HR, tes teknis, live coding, hingga tenggat waktu offering kerja.
- **Follow-up Reminders**: Sistem pengingat otomatis untuk memantau status lamaran yang jatuh tempo (*Overdue*), hari ini, maupun jadwal mendatang.
- **Analytics & Visualisasi Data**: Grafik interaktif menggunakan Recharts untuk melihat rasio konversi wawancara, tingkat penawaran kerja, tren melamar bulanan, serta distribusi saluran rekrutmen.
- **Documents & Private Storage**: Pengelolaan berkas resume/CV, surat lamaran, dan portofolio yang tersimpan aman di private bucket Supabase Storage berproteksi *Signed URL*.
- **Workspace Settings**: Manajemen keamanan akun, pengaturan mata uang preferensi (IDR/USD/SGD/EUR), izin notifikasi browser, dan fitur ekspor cadangan penuh (*Full Database Backup*) ke format JSON.

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/) |
| **Styling & Icons** | [Tailwind CSS](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) |
| **State & Data Fetching** | [TanStack Query v5](https://tanstack.com/query) |
| **Form & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Data Visualization** | [Recharts](https://recharts.org/) |
| **Backend & Database** | [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth, Storage) |
| **Testing & Quality** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) + ISTQB STLC Standards |

---

## 📋 Prasyarat (Prerequisites)

Sebelum menjalankan aplikasi, pastikan sistem Anda telah terpasang:
- **Node.js** (versi 18.x atau lebih baru, direkomendasikan versi LTS terbaru)
- **npm** atau **pnpm**
- Akun dan proyek aktif di [Supabase](https://supabase.com/)

---

## 🚀 Panduan Instalasi & Penggunaan

### 1. Klon Repositori
```bash
git clone <repository-url>
cd JobTrack
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (`.env.local`)
Buat file konfigurasi `.env.local` dari contoh template:
```bash
cp .env.example .env.local
```
Sesuaikan variabel lingkungan dengan URL dan Anon Key proyek Supabase Anda:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Setup Basis Data Supabase
1. Buka **SQL Editor** di Dashboard Supabase Anda.
2. Jalankan skrip skema lengkap: [`supabase/migrations/20261111000000_jobtrack_complete_schema.sql`](supabase/migrations/20261111000000_jobtrack_complete_schema.sql).
3. Buat akun pengguna pertama Anda melalui menu **Authentication ➔ Users**.
4. Tetapkan akun tersebut sebagai pemilik tunggal aplikasi menggunakan [`supabase/migrations/fix_owner_permissions.sql`](supabase/migrations/fix_owner_permissions.sql).

### 5. Menjalankan Aplikasi
```bash
# Menjalankan server pengembangan lokal (Vite)
npm run dev

# Menjalankan seluruh test suite otomatis
npm test

# Menjalankan linter kode (Oxlint)
npm run lint

# Membangun bundle produksi
npm run build
```

---

## 🧪 Pengujian & Kualitas Perangkat Lunak (SQA)

Proyek ini menerapkan standar **Test-Driven Development (TDD)** dan metodologi **ISTQB**:
- **Equivalence Partitioning & Boundary Value Analysis (BVA)** untuk penanganan ukuran berkas, kuota lampiran, serta validasi form input.
- **Sequential Naming Test Suite** untuk memastikan konsistensi penamaan berkas hasil tempel clipboard `dt_YYYYMMDD_xxxx`.

Untuk menjalankan pengujian unit:
```bash
npx vitest run
```

---

## 📄 Lisensi

Hak Cipta © 2026. **JobTrack** dikembangkan untuk penggunaan pribadi (*Private & Personal Use Only*).
