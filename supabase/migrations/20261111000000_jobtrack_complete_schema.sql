-- ==============================================================================
-- JOBTRACK: PRODUCTION DATABASE SCHEMA, RLS POLICIES & STORAGE DEFINITIONS
-- SINGLE-USER SECURE APPLICATION
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. APP OWNER TABLE & SECURITY DEFINER HELPER
-- ==============================================================================

-- Tabel app_owner: Hanya menyimpan tepat 1 record UUID dari auth.users yang berhak
CREATE TABLE IF NOT EXISTS public.app_owner (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function security definer untuk mengecek apakah pemanggil saat ini adalah owner sah
CREATE OR REPLACE FUNCTION public.is_app_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.app_owner
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Aktifkan RLS pada app_owner
ALTER TABLE public.app_owner ENABLE ROW LEVEL SECURITY;

-- Policy: Hanya owner yang boleh melihat datanya sendiri
CREATE POLICY "Owner can read own entry"
  ON public.app_owner FOR SELECT
  USING (user_id = auth.uid());

-- CATATAN KEAMANAN:
-- Tidak ada INSERT, UPDATE, atau DELETE policy pada app_owner untuk client/public.
-- Penambahan akun pemilik HANYA bisa dilakukan langsung melalui SQL Editor / migrasi administratif.

-- ==============================================================================
-- 3. USER PREFERENCES TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.app_owner(user_id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  default_currency TEXT DEFAULT 'IDR' NOT NULL,
  date_format TEXT DEFAULT 'dd MMM yyyy' NOT NULL,
  notification_preferences JSONB DEFAULT '{"browser_notifications": true, "follow_up_lead_days": 2}'::jsonb NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner full access on user_preferences"
  ON public.user_preferences FOR ALL
  USING (user_id = auth.uid() AND public.is_app_owner())
  WITH CHECK (user_id = auth.uid() AND public.is_app_owner());

-- ==============================================================================
-- 4. JOB APPLICATIONS TABLE (CORE TABLE)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.app_owner(user_id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_position TEXT NOT NULL,
  company_website TEXT,
  job_url TEXT,
  job_source TEXT,
  employment_type TEXT DEFAULT 'Full-time', -- Full-time, Part-time, Contract, Freelance, Internship
  work_arrangement TEXT DEFAULT 'Remote',   -- Remote, On-site, Hybrid
  location TEXT,
  application_date DATE DEFAULT CURRENT_DATE NOT NULL,
  status TEXT DEFAULT 'Applied' NOT NULL,   -- Saved, Applied, Screening, HR Interview, Technical Test, User Interview, Final Interview, Offering, Accepted, Rejected, Withdrawn, No Response
  priority TEXT DEFAULT 'Medium' NOT NULL,  -- Low, Medium, High, Top Priority
  expected_salary NUMERIC(15, 2),
  offered_salary NUMERIC(15, 2),
  currency TEXT DEFAULT 'IDR' NOT NULL,
  recruiter_name TEXT,
  recruiter_email TEXT,
  recruiter_phone TEXT,
  follow_up_date DATE,
  job_description TEXT,
  notes TEXT,
  resume_version TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner full access on job_applications"
  ON public.job_applications FOR ALL
  USING (user_id = auth.uid() AND public.is_app_owner())
  WITH CHECK (user_id = auth.uid() AND public.is_app_owner());

-- ==============================================================================
-- 5. APPLICATION STATUS HISTORY (AUDIT TRAIL)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.app_owner(user_id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  notes TEXT,
  changed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner full access on application_status_history"
  ON public.application_status_history FOR ALL
  USING (user_id = auth.uid() AND public.is_app_owner())
  WITH CHECK (user_id = auth.uid() AND public.is_app_owner());

-- ==============================================================================
-- 6. RECRUITMENT EVENTS & CALENDAR
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.recruitment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.app_owner(user_id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'HR Interview', 'Technical Test', 'User Interview', 'Final Interview', 'Follow-up', 'Offer Deadline', 'Other'
  title TEXT NOT NULL,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  location_or_link TEXT,
  reminder_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.recruitment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner full access on recruitment_events"
  ON public.recruitment_events FOR ALL
  USING (user_id = auth.uid() AND public.is_app_owner())
  WITH CHECK (user_id = auth.uid() AND public.is_app_owner());

-- ==============================================================================
-- 7. APPLICATION NOTES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.application_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.app_owner(user_id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner full access on application_notes"
  ON public.application_notes FOR ALL
  USING (user_id = auth.uid() AND public.is_app_owner())
  WITH CHECK (user_id = auth.uid() AND public.is_app_owner());

-- ==============================================================================
-- 8. APPLICATION ATTACHMENTS (METADATA)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.application_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.app_owner(user_id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.application_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner full access on application_attachments"
  ON public.application_attachments FOR ALL
  USING (user_id = auth.uid() AND public.is_app_owner())
  WITH CHECK (user_id = auth.uid() AND public.is_app_owner());

-- ==============================================================================
-- 9. TRIGGERS & AUTOMATION
-- ==============================================================================

-- Trigger Otomatis: Pencatatan ke application_status_history saat status diubah
CREATE OR REPLACE FUNCTION public.handle_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.application_status_history (
      user_id,
      application_id,
      previous_status,
      new_status,
      notes,
      changed_at
    ) VALUES (
      NEW.user_id,
      NEW.id,
      OLD.status,
      NEW.status,
      'Perubahan status rekrutmen dari "' || OLD.status || '" ke "' || NEW.status || '"',
      timezone('utc'::text, now())
    );
  END IF;
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_application_status_change ON public.job_applications;
CREATE TRIGGER tr_application_status_change
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_application_status_change();

-- ==============================================================================
-- 10. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_job_applications_user_status ON public.job_applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_job_applications_priority ON public.job_applications(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_job_applications_date ON public.job_applications(user_id, application_date DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_follow_up ON public.job_applications(user_id, follow_up_date) WHERE follow_up_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recruitment_events_user_start ON public.recruitment_events(user_id, start_datetime);
CREATE INDEX IF NOT EXISTS idx_application_attachments_app ON public.application_attachments(application_id);
CREATE INDEX IF NOT EXISTS idx_application_notes_app ON public.application_notes(application_id);

-- ==============================================================================
-- 11. SUPABASE STORAGE BUCKET & RLS POLICIES
-- ==============================================================================

-- Buat private bucket jika belum ada
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-attachments',
  'job-attachments',
  false,
  10485760, -- 10 MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];

-- Storage RLS Policies
CREATE POLICY "Owner read storage objects"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'job-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_app_owner()
  );

CREATE POLICY "Owner insert storage objects"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'job-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_app_owner()
  );

CREATE POLICY "Owner update storage objects"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'job-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_app_owner()
  );

CREATE POLICY "Owner delete storage objects"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'job-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_app_owner()
  );
