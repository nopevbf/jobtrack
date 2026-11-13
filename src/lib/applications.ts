import type { Database } from '../types/database.types';

type JobApplicationRow = Database['public']['Tables']['job_applications']['Row'];

/**
 * Memformat tipe pekerjaan untuk tampilan tabel. Mengembalikan '-' jika null atau kosong.
 */
export function formatEmploymentType(type: string | null | undefined): string {
  if (!type || !type.trim()) {
    return '-';
  }
  return type.trim();
}

/**
 * Menyaring daftar lamaran berdasarkan tipe pekerjaan.
 */
export function filterApplicationsByEmploymentType(
  applications: JobApplicationRow[],
  employmentType: string | undefined | null
): JobApplicationRow[] {
  if (!employmentType || employmentType === 'all') {
    return applications;
  }
  return applications.filter((app) => app.employment_type === employmentType);
}

/**
 * Mengecek apakah lamaran pekerjaan cocok dengan kata kunci pencarian.
 * Mencakup nama perusahaan, posisi pekerjaan, tipe pekerjaan, dan catatan.
 */
export function matchesApplicationSearch(
  app: JobApplicationRow,
  keyword: string
): boolean {
  if (!keyword || !keyword.trim()) return true;
  const lower = keyword.trim().toLowerCase();

  const company = app.company_name?.toLowerCase() || '';
  const position = app.job_position?.toLowerCase() || '';
  const employmentType = app.employment_type?.toLowerCase() || '';
  const notes = app.notes?.toLowerCase() || '';

  return (
    company.includes(lower) ||
    position.includes(lower) ||
    employmentType.includes(lower) ||
    notes.includes(lower)
  );
}

/**
 * Menghasilkan konten string CSV untuk seluruh data lamaran pekerjaan.
 * Menyisipkan kolom 'Tipe Pekerjaan' tepat di antara 'Posisi' dan 'Status'.
 */
export function buildApplicationsCsvContent(
  applications: JobApplicationRow[]
): string {
  const headers = [
    'ID',
    'Perusahaan',
    'Posisi',
    'Tipe Pekerjaan',
    'Status',
    'Prioritas',
    'Tanggal Melamar',
    'Ekspektasi Gaji',
    'Mata Uang',
    'Sumber',
    'Kontak Recruiter',
  ];

  const rows = applications.map((a) => [
    a.id,
    `"${(a.company_name || '').replace(/"/g, '""')}"`,
    `"${(a.job_position || '').replace(/"/g, '""')}"`,
    a.employment_type || '',
    a.status,
    a.priority,
    a.application_date,
    a.expected_salary || '',
    a.currency || 'IDR',
    `"${(a.job_source || '').replace(/"/g, '""')}"`,
    `"${(a.recruiter_name || '').replace(/"/g, '""')} (${(a.recruiter_email || '').replace(/"/g, '""')})"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
