import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Database, ApplicationStatus, PriorityLevel } from '../types/database.types';
import type { JobApplicationFormValues } from '../lib/validation';
import { useAuth } from '../context/AuthContext';

type JobApplicationRow = Database['public']['Tables']['job_applications']['Row'];

export interface ApplicationFilters {
  search?: string;
  status?: string;
  priority?: string;
  source?: string;
}

export function useApplications(filters?: ApplicationFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['job_applications', filters],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('job_applications')
        .select('*')
        .order('application_date', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as ApplicationStatus);
      }

      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority as PriorityLevel);
      }

      if (filters?.source && filters.source !== 'all') {
        query = query.eq('job_source', filters.source);
      }

      if (filters?.search && filters.search.trim()) {
        const s = `%${filters.search.trim()}%`;
        query = query.or(`company_name.ilike.${s},job_position.ilike.${s},notes.ilike.${s}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as JobApplicationRow[];
    },
    enabled: !!user,
  });
}

export function useApplication(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['job_application', id],
    queryFn: async () => {
      if (!id || !user) return null;

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          application_status_history(*),
          application_notes(*),
          application_attachments(*),
          recruitment_events(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (values: JobApplicationFormValues) => {
      if (!user) throw new Error('Pengguna tidak terotentikasi');

      const payload: Database['public']['Tables']['job_applications']['Insert'] = {
        user_id: user.id,
        company_name: values.company_name,
        job_position: values.job_position,
        company_website: values.company_website || null,
        job_url: values.job_url || null,
        job_source: values.job_source || null,
        employment_type: values.employment_type || 'Full-time',
        work_arrangement: values.work_arrangement || 'Remote',
        location: values.location || null,
        application_date: values.application_date,
        status: values.status,
        priority: values.priority,
        expected_salary: values.expected_salary || null,
        offered_salary: values.offered_salary || null,
        currency: values.currency || 'IDR',
        recruiter_name: values.recruiter_name || null,
        recruiter_email: values.recruiter_email || null,
        recruiter_phone: values.recruiter_phone || null,
        follow_up_date: values.follow_up_date || null,
        job_description: values.job_description || null,
        notes: values.notes || null,
        resume_version: values.resume_version || null,
      };

      const { data, error } = await supabase
        .from('job_applications')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      queryClient.invalidateQueries({ queryKey: ['analytics_metrics'] });
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<JobApplicationFormValues> }) => {
      const { data, error } = await supabase
        .from('job_applications')
        .update(values as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job_applications'] });
      queryClient.invalidateQueries({ queryKey: ['job_application', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      queryClient.invalidateQueries({ queryKey: ['analytics_metrics'] });
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const { data, error } = await supabase
        .from('job_applications')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job_applications'] });
      queryClient.invalidateQueries({ queryKey: ['job_application', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      queryClient.invalidateQueries({ queryKey: ['analytics_metrics'] });
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('job_applications').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      queryClient.invalidateQueries({ queryKey: ['analytics_metrics'] });
    },
  });
}
