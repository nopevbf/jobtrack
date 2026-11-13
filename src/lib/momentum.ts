import type { Database } from '../types/database.types';

type JobApplicationRow = Database['public']['Tables']['job_applications']['Row'];
type RecruitmentEventRow = Database['public']['Tables']['recruitment_events']['Row'];

export interface MomentumResult {
  score: number;
  activeRatio: number;
  followUpRatio: number;
  scheduleRatio: number;
  statusLabel: string;
  statusDescription: string;
  colorTheme: 'emerald' | 'amber' | 'rose' | 'muted';
}

export const INTERVIEW_STATUSES = [
  'Screening',
  'HR Interview',
  'Technical Test',
  'User Interview',
  'Final Interview',
] as const;

export const INACTIVE_STATUSES = ['Accepted', 'Rejected', 'Withdrawn'] as const;

/**
 * Menghitung skor momentum pencarian kerja secara dinamis
 * Bobot:
 * - 40% Rasio Lamaran Aktif
 * - 30% Rasio Follow-up Tepat Waktu (on-track)
 * - 30% Rasio Penjadwalan Wawancara/Tes
 */
export function calculateJobSearchMomentum(
  apps: JobApplicationRow[] = [],
  events: RecruitmentEventRow[] = [],
  todayStr: string = new Date().toISOString().split('T')[0]
): MomentumResult {
  // Empty State: Belum ada lamaran sama sekali
  if (!apps || apps.length === 0) {
    return {
      score: 0,
      activeRatio: 0,
      followUpRatio: 0,
      scheduleRatio: 0,
      statusLabel: 'Belum Ada Aktivitas',
      statusDescription: 'Mulai catat lamaran pekerjaan Anda untuk mengaktifkan pelacakan momentum pencarian kerja.',
      colorTheme: 'muted',
    };
  }

  // 1. Rasio Lamaran Aktif (Bobot 40%)
  const activeApps = apps.filter((a) => !INACTIVE_STATUSES.includes(a.status as any));
  const activeRatio = Math.round((activeApps.length / apps.length) * 100);

  // 2. Rasio Follow-up Tepat Waktu (Bobot 30%)
  const activeAppsWithFollowUp = activeApps.filter((a) => !!a.follow_up_date);
  let followUpRatio = 100;
  if (activeAppsWithFollowUp.length > 0) {
    const onTrackFollowUps = activeAppsWithFollowUp.filter(
      (a) => a.follow_up_date! >= todayStr
    ).length;
    followUpRatio = Math.round((onTrackFollowUps / activeAppsWithFollowUp.length) * 100);
  }

  // 3. Rasio Kesiapan Jadwal (Bobot 30%)
  const interviewApps = activeApps.filter((a) =>
    INTERVIEW_STATUSES.includes(a.status as any)
  );
  let scheduleRatio = 100;
  if (interviewApps.length > 0) {
    const scheduledCount = interviewApps.filter((app) =>
      events.some((e) => e.application_id === app.id && !e.is_completed)
    ).length;
    scheduleRatio = Math.round((scheduledCount / interviewApps.length) * 100);
  }

  // Kalkulasi Skor Terbobot
  const weightedScore = Math.round(
    activeRatio * 0.4 + followUpRatio * 0.3 + scheduleRatio * 0.3
  );
  const score = Math.min(100, Math.max(0, weightedScore));

  // Penentuan Label & Tema Warna berdasarkan Ambang Batas (Thresholds)
  let statusLabel = 'Belum Ada Aktivitas';
  let statusDescription = 'Mulai catat lamaran pekerjaan Anda untuk mengaktifkan pelacakan momentum pencarian kerja.';
  let colorTheme: 'emerald' | 'amber' | 'rose' | 'muted' = 'muted';

  if (score >= 80) {
    statusLabel = 'Pipeline Berjalan Lancar';
    statusDescription = 'Tingkat tindak lanjut & follow-up lamaran Anda berada dalam rasio optimal.';
    colorTheme = 'emerald';
  } else if (score >= 50) {
    statusLabel = 'Perkembangan Cukup Stabil';
    statusDescription = 'Aktivitas lamaran berjalan baik. Jaga konsistensi jadwal wawancara dan follow-up.';
    colorTheme = 'amber';
  } else if (score > 0) {
    statusLabel = 'Perlu Ditingkatkan';
    statusDescription = 'Ada follow-up yang terlewat atau lamaran yang perlu ditindaklanjuti segera.';
    colorTheme = 'rose';
  }

  return {
    score,
    activeRatio,
    followUpRatio,
    scheduleRatio,
    statusLabel,
    statusDescription,
    colorTheme,
  };
}
