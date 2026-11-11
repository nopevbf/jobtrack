import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Database } from '../types/database.types';

type JobApplicationRow = Database['public']['Tables']['job_applications']['Row'];
type RecruitmentEventRow = Database['public']['Tables']['recruitment_events']['Row'];

export interface DashboardStats {
  totalApplications: number;
  activeApplications: number;
  interviewsCount: number;
  offersCount: number;
  rejectedCount: number;
  followUpsDueCount: number;
  recentApplications: JobApplicationRow[];
  upcomingEvents: (RecruitmentEventRow & { job_applications?: { company_name: string; job_position: string } | null })[];
  statusDistribution: { status: string; count: number }[];
}

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) {
        return {
          totalApplications: 0,
          activeApplications: 0,
          interviewsCount: 0,
          offersCount: 0,
          rejectedCount: 0,
          followUpsDueCount: 0,
          recentApplications: [],
          upcomingEvents: [],
          statusDistribution: [],
        };
      }

      // Ambil seluruh data aplikasi milik user
      const { data: apps, error: appsError } = await supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;

      const allApps = apps || [];
      const todayStr = new Date().toISOString().split('T')[0];

      const totalApplications = allApps.length;

      const activeApplications = allApps.filter(
        (a) => !['Accepted', 'Rejected', 'Withdrawn'].includes(a.status)
      ).length;

      const interviewsCount = allApps.filter((a) =>
        ['Screening', 'HR Interview', 'Technical Test', 'User Interview', 'Final Interview'].includes(
          a.status
        )
      ).length;

      const offersCount = allApps.filter((a) =>
        ['Offering', 'Accepted'].includes(a.status)
      ).length;

      const rejectedCount = allApps.filter((a) => a.status === 'Rejected').length;

      const followUpsDueCount = allApps.filter(
        (a) => a.follow_up_date && a.follow_up_date <= todayStr && !['Accepted', 'Rejected', 'Withdrawn'].includes(a.status)
      ).length;

      const recentApplications = allApps.slice(0, 5);

      // Hitung distribusi status
      const statusMap: Record<string, number> = {};
      allApps.forEach((a) => {
        statusMap[a.status] = (statusMap[a.status] || 0) + 1;
      });
      const statusDistribution = Object.entries(statusMap).map(([status, count]) => ({
        status,
        count,
      }));

      // Ambil upcoming events
      const { data: events, error: eventsError } = await supabase
        .from('recruitment_events')
        .select(`
          *,
          job_applications (
            company_name,
            job_position
          )
        `)
        .eq('is_completed', false)
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true })
        .limit(5);

      if (eventsError) throw eventsError;

      return {
        totalApplications,
        activeApplications,
        interviewsCount,
        offersCount,
        rejectedCount,
        followUpsDueCount,
        recentApplications,
        upcomingEvents: (events as any) || [],
        statusDistribution,
      };
    },
    enabled: !!user,
  });
}
