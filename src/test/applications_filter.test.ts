import { describe, it, expect } from 'vitest';
import {
  formatEmploymentType,
  buildApplicationsCsvContent,
  filterApplicationsByEmploymentType,
  matchesApplicationSearch,
} from '../lib/applications';
import type { Database } from '../types/database.types';

type JobApplicationRow = Database['public']['Tables']['job_applications']['Row'];

describe('Job Applications Column & Filter (TDD & ISTQB)', () => {
  const dummyApplications: Partial<JobApplicationRow>[] = [
    {
      id: 'app-1',
      company_name: 'Tech Corp',
      job_position: 'Frontend Engineer',
      employment_type: 'Full-time',
      status: 'Applied',
      priority: 'High',
      application_date: '2026-11-10',
      expected_salary: 20000000,
      currency: 'IDR',
      job_source: 'LinkedIn',
      recruiter_name: 'Jane',
      recruiter_email: 'jane@techcorp.com',
      notes: 'Referral dari Budi',
    },
    {
      id: 'app-2',
      company_name: 'Design Studio',
      job_position: 'UI/UX Designer',
      employment_type: 'Contract',
      status: 'HR Interview',
      priority: 'Medium',
      application_date: '2026-11-09',
      expected_salary: 15000000,
      currency: 'IDR',
      job_source: 'Glints',
      recruiter_name: 'John',
      recruiter_email: 'john@studio.com',
      notes: 'Kontrak 6 bulan',
    },
    {
      id: 'app-3',
      company_name: 'Startup Legacy',
      job_position: 'Backend Developer',
      employment_type: null, // Legacy data without employment_type
      status: 'Saved',
      priority: 'Low',
      application_date: '2026-11-08',
      expected_salary: 18000000,
      currency: 'IDR',
      job_source: 'Jobstreet',
      recruiter_name: null,
      recruiter_email: null,
      notes: null,
    },
  ];

  describe('ISTQB EP & BVA: formatEmploymentType', () => {
    it('TC-APP-EP-001: Mengembalikan nilai tipe pekerjaan yang valid secara utuh', () => {
      expect(formatEmploymentType('Full-time')).toBe('Full-time');
      expect(formatEmploymentType('Part-time')).toBe('Part-time');
      expect(formatEmploymentType('Contract')).toBe('Contract');
      expect(formatEmploymentType('Freelance')).toBe('Freelance');
      expect(formatEmploymentType('Internship')).toBe('Internship');
    });

    it('TC-APP-EP-002: Mengembalikan "-" jika nilai null, undefined, atau string kosong', () => {
      expect(formatEmploymentType(null)).toBe('-');
      expect(formatEmploymentType(undefined)).toBe('-');
      expect(formatEmploymentType('')).toBe('-');
      expect(formatEmploymentType('   ')).toBe('-');
    });
  });

  describe('ISTQB EP: filterApplicationsByEmploymentType', () => {
    it('TC-APP-FILTER-001: Memfilter lamaran berdasarkan employment_type spesifik (Contract)', () => {
      const filtered = filterApplicationsByEmploymentType(dummyApplications as JobApplicationRow[], 'Contract');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('app-2');
      expect(filtered[0].employment_type).toBe('Contract');
    });

    it('TC-APP-FILTER-002: Mengembalikan seluruh data jika filter bernilai "all" atau kosong', () => {
      const all1 = filterApplicationsByEmploymentType(dummyApplications as JobApplicationRow[], 'all');
      expect(all1).toHaveLength(3);

      const all2 = filterApplicationsByEmploymentType(dummyApplications as JobApplicationRow[], '');
      expect(all2).toHaveLength(3);
    });
  });

  describe('ISTQB Decision & Keyword Matching: matchesApplicationSearch', () => {
    it('TC-APP-SEARCH-001: Menemukan lamaran ketika kata kunci cocok dengan employment_type', () => {
      const app = dummyApplications[1] as JobApplicationRow; // Contract
      expect(matchesApplicationSearch(app, 'contract')).toBe(true);
      expect(matchesApplicationSearch(app, 'CONTRACT')).toBe(true);
    });

    it('TC-APP-SEARCH-002: Menemukan lamaran ketika kata kunci cocok dengan company_name atau job_position', () => {
      const app = dummyApplications[0] as JobApplicationRow;
      expect(matchesApplicationSearch(app, 'Tech')).toBe(true);
      expect(matchesApplicationSearch(app, 'Frontend')).toBe(true);
    });

    it('TC-APP-SEARCH-003: Mengembalikan false jika tidak ada kolom yang cocok', () => {
      const app = dummyApplications[0] as JobApplicationRow;
      expect(matchesApplicationSearch(app, 'NonExistentXYZ')).toBe(false);
    });
  });

  describe('ISTQB Data Integrity: buildApplicationsCsvContent', () => {
    it('TC-APP-CSV-001: Menyisipkan kolom "Tipe Pekerjaan" tepat di antara "Posisi" dan "Status" pada Header CSV', () => {
      const csv = buildApplicationsCsvContent(dummyApplications as JobApplicationRow[]);
      const firstLine = csv.split('\n')[0];
      const headers = firstLine.split(',');

      const posisiIndex = headers.indexOf('Posisi');
      const tipePekerjaanIndex = headers.indexOf('Tipe Pekerjaan');
      const statusIndex = headers.indexOf('Status');

      expect(posisiIndex).toBeGreaterThan(-1);
      expect(tipePekerjaanIndex).toBe(posisiIndex + 1);
      expect(statusIndex).toBe(tipePekerjaanIndex + 1);
    });

    it('TC-APP-CSV-002: Menyisipkan nilai tipe pekerjaan di antara posisi dan status pada setiap baris data CSV', () => {
      const csv = buildApplicationsCsvContent(dummyApplications as JobApplicationRow[]);
      const lines = csv.split('\n');

      // Baris kedua (app-1: Full-time)
      const row1 = lines[1];
      expect(row1).toContain('"Frontend Engineer",Full-time,Applied');

      // Baris ketiga (app-2: Contract)
      const row2 = lines[2];
      expect(row2).toContain('"UI/UX Designer",Contract,HR Interview');

      // Baris keempat (app-3: null -> string kosong di CSV)
      const row3 = lines[3];
      expect(row3).toContain('"Backend Developer",,Saved');
    });
  });
});
