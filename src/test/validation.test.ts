import { describe, it, expect } from 'vitest';
import { jobApplicationSchema, recruitmentEventSchema } from '../lib/validation';

describe('Zod Validation Schemas TDD', () => {
  describe('jobApplicationSchema', () => {
    it('lulus validasi ketika data wajib diisi dengan benar', () => {
      const validData = {
        company_name: 'Tech Corp',
        job_position: 'Senior Frontend Engineer',
        application_date: '2026-11-11',
        status: 'Applied',
        priority: 'High',
        currency: 'IDR',
        expected_salary: 25000000,
      };

      const result = jobApplicationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('gagal validasi jika company_name kosong', () => {
      const invalidData = {
        company_name: '',
        job_position: 'Backend Developer',
        status: 'Applied',
        priority: 'Medium',
      };

      const result = jobApplicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.company_name).toBeDefined();
      }
    });

    it('gagal validasi jika job_position kosong', () => {
      const invalidData = {
        company_name: 'Google',
        job_position: '   ',
        status: 'Applied',
      };

      const result = jobApplicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('memvalidasi format email recruiter jika disediakan', () => {
      const invalidEmailData = {
        company_name: 'Startup XYZ',
        job_position: 'Product Designer',
        recruiter_email: 'not-an-email',
      };

      const result = jobApplicationSchema.safeParse(invalidEmailData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.recruiter_email).toBeDefined();
      }
    });

    it('memvalidasi URL jika company_website diisi', () => {
      const invalidUrlData = {
        company_name: 'Startup XYZ',
        job_position: 'Product Designer',
        company_website: 'invalid-url-without-protocol',
      };

      const result = jobApplicationSchema.safeParse(invalidUrlData);
      expect(result.success).toBe(false);
    });
  });

  describe('recruitmentEventSchema', () => {
    it('lulus validasi event interview dengan tanggal mulai valid', () => {
      const validEvent = {
        event_type: 'HR Interview',
        title: 'HR Screening with Recruiters',
        start_datetime: '2026-11-15T10:00:00Z',
      };

      const result = recruitmentEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('gagal validasi jika title event kosong', () => {
      const invalidEvent = {
        event_type: 'Technical Test',
        title: '',
        start_datetime: '2026-11-15T10:00:00Z',
      };

      const result = recruitmentEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });
});
