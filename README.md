# JobTrack — Private Single-User Job Application Tracker

JobTrack adalah aplikasi pelacak lamaran pekerjaan pribadi (*single-user*) yang dirancang khusus untuk memonitor progres rekrutmen, jadwal wawancara, catatan evaluasi, berkas dokumen, serta performa pencarian kerja secara terpusat dan aman berbasis **Supabase**.

---

## 🌟 Fitur Utama

- **Single-User Security & Authorization**: Menggunakan tabel `app_owner` dan PostgreSQL Row Level Security (RLS) serta helper function `is_app_owner()` untuk memastikan hanya satu pemilik sah yang memiliki izin baca dan tulis data. Pendaftaran publik dinonaktifkan secara permanen.
- **Modern Linear/Notion-Inspired UI**: Tampilan minimalis beraksen ungu/violet modern, mendukung mode Gelap (*Dark*) dan Terang (*Light*), serta sepenuhnya responsif untuk desktop dan perangkat seluler.
- **Executive Dashboard**: 4 kartu metrik gradien (Total Applications, Active, Waiting for Interview, Offers), widget agenda wawancara terdekat, pengukur momentum lamaran, dan tabel lamaran terbaru.
- **Job Applications Management**: Manajemen lamaran lengkap (CRUD) dengan pencarian cepat, filter status, prioritas, sumber lowongan, tanggal melamar, paginasi, dan ekspor ke file CSV.
- **Recruitment Kanban Pipeline**: Pipeline interaktif *drag-and-drop* yang mencakup 12 tahapan rekrutmen (*Saved, Applied, Screening, HR Interview, Technical Test, User Interview, Final Interview, Offering, Accepted, Rejected, Withdrawn, No Response*) dengan sinkronisasi instan ke Supabase.
- **Detail Lamaran & Audit Trail**: Informasi kompensasi gaji, kontak rekruter, tautan lowongan, catatan evaluasi interview, serta riwayat perubahan status otomatis.
- **Interview & Event Calendar**: Manajemen jadwal wawancara HR, tes teknis, live coding, dan tenggat waktu penawaran kerja.
- **Follow-up Reminders**: Pengingat tindak lanjut berkas yang jatuh tempo (*Overdue*), hari ini, maupun mendatang.
- **Analytics & Visualisasi Data**: Rasio konversi wawancara, tingkat penawaran (*offer conversion rate*), tingkat penolakan, tren aktivitas melamar bulanan, dan distribusi sumber lowongan menggunakan Recharts.
- **Documents & Private Storage**: Penyimpanan aman dokumen CV, resume, portofolio, dan offering letter di private bucket Supabase Storage berproteksi *Signed URL*.
- **Workspace Settings**: Manajemen kata sandi akun, pengaturan preferensi tema, mata uang default (IDR), izin notifikasi browser, dan pencadangan penuh database ke file JSON (*Full Export*).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, React Router, TanStack Query, React Hook Form + Zod, Recharts, date-fns.
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Row Level Security, Supabase Storage).
- **Testing & SQA**: Vitest, React Testing Library, ISTQB standard test design.

---

## 🚀 Panduan Menjalankan Proyek

### 1. Klon Repositori & Instal Dependensi
```bash
git clone <repository-url>
cd JobTrack
npm install
```

### 2. Konfigurasi Lingkungan (.env.local)
Salin contoh konfigurasi:
```bash
cp .env.example .env.local
```
Lalu isi kredensial Supabase Anda di `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Migrasi Skema Basis Data di Supabase
1. Buka **SQL Editor** pada dashboard proyek Supabase Anda.
2. Jalankan isi file [`supabase/migrations/20261111000000_jobtrack_complete_schema.sql`](supabase/migrations/20261111000000_jobtrack_complete_schema.sql).
3. Buat akun pemilik di **Authentication ➔ Users**, lalu daftarkan ke tabel pemilik melalui [`supabase/migrations/fix_owner_permissions.sql`](supabase/migrations/fix_owner_permissions.sql).

### 4. Jalankan Aplikasi
```bash
# Menjalankan server pengembangan lokal
npm run dev

# Menjalankan pengujian otomatis (Unit & SQA)
npm test

# Membuat build produksi
npm run build
```

---

## 📄 Lisensi
Hak Cipta © 2026. Private & Personal Use Only.
