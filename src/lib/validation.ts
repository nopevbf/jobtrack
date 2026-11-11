import { z } from 'zod';

export const jobApplicationSchema = z.object({
  company_name: z.string().trim().min(1, 'Nama perusahaan wajib diisi'),
  job_position: z.string().trim().min(1, 'Posisi pekerjaan wajib diisi'),
  company_website: z
    .string()
    .trim()
    .url('Format URL website perusahaan tidak valid')
    .or(z.literal(''))
    .optional()
    .nullable(),
  job_url: z
    .string()
    .trim()
    .url('Format URL lowongan tidak valid')
    .or(z.literal(''))
    .optional()
    .nullable(),
  job_source: z.string().trim().optional().nullable(),
  employment_type: z.string().trim().default('Full-time').optional().nullable(),
  work_arrangement: z.string().trim().default('Remote').optional().nullable(),
  location: z.string().trim().optional().nullable(),
  application_date: z.string().default(() => new Date().toISOString().split('T')[0]),
  status: z
    .enum([
      'Saved',
      'Applied',
      'Screening',
      'HR Interview',
      'Technical Test',
      'User Interview',
      'Final Interview',
      'Offering',
      'Accepted',
      'Rejected',
      'Withdrawn',
      'No Response',
    ])
    .default('Applied'),
  priority: z.enum(['Low', 'Medium', 'High', 'Top Priority']).default('Medium'),
  expected_salary: z.coerce.number().positive('Gaji yang diharapkan harus angka positif').optional().nullable(),
  offered_salary: z.coerce.number().positive('Gaji yang ditawarkan harus angka positif').optional().nullable(),
  currency: z.string().default('IDR'),
  recruiter_name: z.string().trim().optional().nullable(),
  recruiter_email: z
    .string()
    .trim()
    .email('Format email recruiter tidak valid')
    .or(z.literal(''))
    .optional()
    .nullable(),
  recruiter_phone: z.string().trim().optional().nullable(),
  follow_up_date: z.string().optional().nullable(),
  job_description: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  resume_version: z.string().trim().optional().nullable(),
});

export type JobApplicationFormValues = z.infer<typeof jobApplicationSchema>;

export const recruitmentEventSchema = z.object({
  application_id: z.string().uuid().optional().nullable(),
  event_type: z.string().trim().min(1, 'Tipe agenda rekrutmen wajib dipilih'),
  title: z.string().trim().min(1, 'Judul agenda wajib diisi'),
  start_datetime: z.string().min(1, 'Waktu mulai wajib ditentukan'),
  end_datetime: z.string().optional().nullable(),
  location_or_link: z.string().trim().optional().nullable(),
  reminder_at: z.string().optional().nullable(),
  is_completed: z.boolean().default(false),
  notes: z.string().trim().optional().nullable(),
});

export type RecruitmentEventFormValues = z.infer<typeof recruitmentEventSchema>;
