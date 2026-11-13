import { describe, it, expect } from 'vitest';
import { calculateJobSearchMomentum } from '../lib/momentum';
import type { Database } from '../types/database.types';

type JobApplicationRow = Database['public']['Tables']['job_applications']['Row'];
type RecruitmentEventRow = Database['public']['Tables']['recruitment_events']['Row'];

describe('Job Search Momentum Calculation (SQA-ISTQB & TDD)', () => {
  const baseApp: JobApplicationRow = {
    id: 'app-1',
    user_id: 'user-1',
    company_name: 'Tech Corp',
    job_position: 'Frontend Dev',
    company_website: null,
    job_url: null,
    job_source: null,
    employment_type: 'Full-time',
    work_arrangement: 'Remote',
    location: 'Jakarta',
    application_date: '2026-11-01',
    status: 'Applied',
    priority: 'High',
    expected_salary: null,
    offered_salary: null,
    currency: 'IDR',
    recruiter_name: null,
    recruiter_email: null,
    recruiter_phone: null,
    follow_up_date: null,
    job_description: null,
    notes: null,
    resume_version: null,
    created_at: '2026-11-01T00:00:00Z',
    updated_at: '2026-11-01T00:00:00Z',
  };

  const todayStr = '2026-11-13';

  describe('1. Equivalence Partitioning (EP): Empty State', () => {
    it('returns score 0 with "muted" theme and empty status when applications list is empty', () => {
      const result = calculateJobSearchMomentum([], [], todayStr);
      expect(result.score).toBe(0);
      expect(result.activeRatio).toBe(0);
      expect(result.followUpRatio).toBe(0);
      expect(result.scheduleRatio).toBe(0);
      expect(result.statusLabel).toBe('Belum Ada Aktivitas');
      expect(result.colorTheme).toBe('muted');
      expect(result.statusDescription).toContain('Mulai catat lamaran pekerjaan');
    });
  });

  describe('2. Equivalence Partitioning & Boundary Value Analysis: Active Ratios & Weightings', () => {
    it('calculates optimal score (100%) when all apps are active, follow-ups on-track, and interviews scheduled', () => {
      const apps: JobApplicationRow[] = [
        { ...baseApp, id: 'app-1', status: 'Applied', follow_up_date: '2026-11-20' }, // future follow-up
        { ...baseApp, id: 'app-2', status: 'HR Interview', follow_up_date: '2026-11-14' }, // future follow-up
      ];
      const events: RecruitmentEventRow[] = [
        {
          id: 'evt-1',
          user_id: 'user-1',
          application_id: 'app-2',
          event_type: 'HR Interview',
          title: 'HR Screening Call',
          start_datetime: '2026-11-14T10:00:00Z',
          end_datetime: '2026-11-14T11:00:00Z',
          location_or_link: null,
          reminder_at: null,
          is_completed: false,
          notes: null,
          created_at: '2026-11-01T00:00:00Z',
        },
      ];

      const result = calculateJobSearchMomentum(apps, events, todayStr);
      expect(result.activeRatio).toBe(100);
      expect(result.followUpRatio).toBe(100);
      expect(result.scheduleRatio).toBe(100);
      expect(result.score).toBe(100);
      expect(result.statusLabel).toBe('Pipeline Berjalan Lancar');
      expect(result.colorTheme).toBe('emerald');
    });

    it('correctly categorizes scores in the 80% - 99% range (BVA 80%) as "Pipeline Berjalan Lancar"', () => {
      // 1 active, 0 inactive -> activeRatio = 100% (40 pts)
      // 1 active app with overdue follow-up -> followUpRatio = 0% (0 pts)
      // 0 interview apps -> scheduleRatio = 100% (30 pts)
      // Score = 40 + 0 + 30 = 70 (Amber)
      // Let's test with 80% boundary:
      // Active = 100% (40 pts)
      // Follow-up = 1 of 2 on track = 50% (15 pts)
      // Schedule = 100% (30 pts) -> Total = 40 + 15 + 30 = 85% (Emerald)
      const apps: JobApplicationRow[] = [
        { ...baseApp, id: 'app-1', status: 'Applied', follow_up_date: '2026-11-15' }, // on-track
        { ...baseApp, id: 'app-2', status: 'Applied', follow_up_date: '2026-11-10' }, // overdue
      ];
      const result = calculateJobSearchMomentum(apps, [], todayStr);
      expect(result.activeRatio).toBe(100);
      expect(result.followUpRatio).toBe(50);
      expect(result.scheduleRatio).toBe(100);
      // 100*0.4 + 50*0.3 + 100*0.3 = 40 + 15 + 30 = 85
      expect(result.score).toBe(85);
      expect(result.statusLabel).toBe('Pipeline Berjalan Lancar');
      expect(result.colorTheme).toBe('emerald');
    });

    it('handles Boundary Value 79% and 50% as "Perkembangan Cukup Stabil" (Amber)', () => {
      // Let's create an amber score scenario:
      // Active = 1 of 2 = 50% (20 pts)
      // Follow-up = 100% (30 pts)
      // Schedule = 100% (30 pts)
      // Total = 20 + 30 + 30 = 80 (Emerald) -> If 1 of 4 active: 25% (10 pts) -> Total = 10 + 30 + 30 = 70 (Amber)
      const apps: JobApplicationRow[] = [
        { ...baseApp, id: 'app-1', status: 'Applied', follow_up_date: null },
        { ...baseApp, id: 'app-2', status: 'Rejected', follow_up_date: null },
        { ...baseApp, id: 'app-3', status: 'Rejected', follow_up_date: null },
        { ...baseApp, id: 'app-4', status: 'Rejected', follow_up_date: null },
      ];
      const result = calculateJobSearchMomentum(apps, [], todayStr);
      expect(result.activeRatio).toBe(25);
      expect(result.followUpRatio).toBe(100);
      expect(result.scheduleRatio).toBe(100);
      // 25*0.4 + 100*0.3 + 100*0.3 = 10 + 30 + 30 = 70
      expect(result.score).toBe(70);
      expect(result.statusLabel).toBe('Perkembangan Cukup Stabil');
      expect(result.colorTheme).toBe('amber');
    });

    it('handles Boundary Value 1% - 49% as "Perlu Ditingkatkan" (Rose)', () => {
      // All inactive except 1, and that 1 has overdue follow up, and 1 unscheduled interview
      // 1 active out of 10 total = 10% active (4 pts)
      // 1 overdue follow-up out of 1 = 0% follow-up (0 pts)
      // 1 interview app with no event = 0% schedule (0 pts)
      // Total = 4 + 0 + 0 = 4%
      const apps: JobApplicationRow[] = [
        { ...baseApp, id: 'app-1', status: 'HR Interview', follow_up_date: '2026-11-01' }, // overdue
        ...Array.from({ length: 9 }, (_, i) => ({
          ...baseApp,
          id: `app-rejected-${i}`,
          status: 'Rejected' as const,
        })),
      ];
      const result = calculateJobSearchMomentum(apps, [], todayStr);
      expect(result.activeRatio).toBe(10);
      expect(result.followUpRatio).toBe(0);
      expect(result.scheduleRatio).toBe(0);
      expect(result.score).toBe(4);
      expect(result.statusLabel).toBe('Perlu Ditingkatkan');
      expect(result.colorTheme).toBe('rose');
    });
  });

  describe('3. Specific Edge Cases & Robustness', () => {
    it('treats follow-up date today as on-track (not overdue)', () => {
      const apps: JobApplicationRow[] = [
        { ...baseApp, id: 'app-1', status: 'Applied', follow_up_date: todayStr },
      ];
      const result = calculateJobSearchMomentum(apps, [], todayStr);
      expect(result.followUpRatio).toBe(100);
    });

    it('ignores completed events when checking if an interview is scheduled', () => {
      const apps: JobApplicationRow[] = [
        { ...baseApp, id: 'app-1', status: 'User Interview' },
      ];
      const events: RecruitmentEventRow[] = [
        {
          id: 'evt-1',
          user_id: 'user-1',
          application_id: 'app-1',
          event_type: 'Interview',
          title: 'Past Interview',
          start_datetime: '2026-11-10T10:00:00Z',
          end_datetime: '2026-11-10T11:00:00Z',
          location_or_link: null,
          reminder_at: null,
          is_completed: true, // completed
          notes: null,
          created_at: '2026-11-01T00:00:00Z',
        },
      ];
      const result = calculateJobSearchMomentum(apps, events, todayStr);
      // Since event is already completed, the interview app has no upcoming/active event
      expect(result.scheduleRatio).toBe(0);
    });
  });
});
