-- ==============================================================================
-- JOBTRACK: FIX PRIVILEGES & DAFTARKAN OWNER (firajitio@gmail.com)
-- ==============================================================================

-- 1. Berikan hak akses tabel ke role 'authenticated' (agar Supabase Client bisa membaca setelah login)
GRANT USAGE ON SCHEMA public TO authenticated, anon;

GRANT SELECT ON public.app_owner TO authenticated;
GRANT ALL ON public.job_applications TO authenticated;
GRANT ALL ON public.application_status_history TO authenticated;
GRANT ALL ON public.recruitment_events TO authenticated;
GRANT ALL ON public.application_notes TO authenticated;
GRANT ALL ON public.application_attachments TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;

-- 2. Buat RPC Helper dengan SECURITY DEFINER agar verifikasi owner selalu lancar
CREATE OR REPLACE FUNCTION public.check_is_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.app_owner
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.check_is_owner() TO authenticated, anon;

-- 3. Masukkan akun firajitio@gmail.com ke app_owner dan user_preferences
INSERT INTO public.app_owner (user_id)
SELECT id FROM auth.users WHERE LOWER(email) = 'firajitio@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_preferences (user_id, theme, default_currency, date_format)
SELECT id, 'light', 'IDR', 'dd MMM yyyy' FROM auth.users WHERE LOWER(email) = 'firajitio@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- 4. Tampilkan status untuk memastikan berhasil
SELECT 
  ao.user_id, 
  u.email, 
  ao.created_at 
FROM public.app_owner ao
JOIN auth.users u ON u.id = ao.user_id;
