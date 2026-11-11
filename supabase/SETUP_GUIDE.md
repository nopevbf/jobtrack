# PANDUAN SETUP SUPABASE CLOUD — JOBTRACK

Ikuti langkah-langkah di bawah ini untuk menghubungkan **JobTrack Project** di Supabase Cloud:

---

## Langkah 1: Jalankan Database Migration & RLS Script
1. Masuk ke dashboard Supabase: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Buka proyek **JobTrack Project**.
3. Di panel kiri, klik **SQL Editor**.
4. Klik **+ New Query**.
5. Salin seluruh isi file:
   `supabase/migrations/20261111000000_jobtrack_complete_schema.sql`
6. Tempel ke SQL Editor dan klik tombol **Run** (Ctrl + Enter).
7. Pastikan muncul notifikasi **"Success. No rows returned"**.
   *Ini akan membuat tabel `app_owner`, `job_applications`, `application_status_history`, `recruitment_events`, `application_notes`, `application_attachments`, `user_preferences`, mengaktifkan seluruh RLS policies, membuat storage bucket `job-attachments`, dan trigger riwayat status otomatis.*

---

## Langkah 2: Buat Akun Pemilik (App Owner) & Ambil User UID
1. Di panel kiri dashboard Supabase, klik **Authentication** -> **Users**.
2. Klik tombol **Add User** -> pilih **Create User**.
3. Masukkan:
   - **Email**: Email pribadi Anda (misal: `owner@example.com`)
   - **Password**: Password aman Anda
   - Centang opsi **Auto Confirm User?** (agar langsung aktif tanpa konfirmasi email).
4. Klik **Create User**.
5. Pada daftar pengguna, cari user yang baru dibuat, klik ikon salin pada kolom **User UID** (contoh format: `a1b2c3d4-e5f6-7890-abcd-1234567890ab`).

---

## Langkah 3: Daftarkan UID Pemilik ke Tabel `app_owner`
1. Kembali ke **SQL Editor**.
2. Buka query baru dan jalankan perintah berikut (ganti dengan UUID yang Anda salin di Langkah 2):

```sql
INSERT INTO public.app_owner (user_id)
VALUES ('PASTE_USER_UID_ANDA_DI_SINI'::uuid)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_preferences (user_id, theme, default_currency, date_format)
VALUES ('PASTE_USER_UID_ANDA_DI_SINI'::uuid, 'light', 'IDR', 'dd MMM yyyy')
ON CONFLICT (user_id) DO NOTHING;
```
3. Klik **Run**. Sekarang database Anda telah mengunci kepemilikan eksklusif hanya untuk akun tersebut.

---

## Langkah 4: Nonaktifkan Registrasi Publik (Disable Sign Ups)
1. Di panel kiri dashboard Supabase, buka **Authentication** -> **Providers** -> **Email**.
2. Matikan toggle / uncheck: **Enable Signups** (atau di **Authentication** -> **Sign In / Up**, matikan "Allow new users to sign up").
3. Klik **Save**. Ini menjamin tidak ada orang asing yang bisa membuat akun baru.

---

## Langkah 5: Salin Kredensial ke `.env.local`
1. Buka **Project Settings** (ikon gerigi di kiri bawah) -> **API**.
2. Salin nilai:
   - **Project URL** -> masukkan ke `VITE_SUPABASE_URL` di `.env.local`
   - **Project API Keys** -> bagian `anon` `public` -> masukkan ke `VITE_SUPABASE_ANON_KEY` di `.env.local`

Contoh isi file `.env.local`:
```env
VITE_SUPABASE_URL=https://abcdefghijklmnopqrst.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
