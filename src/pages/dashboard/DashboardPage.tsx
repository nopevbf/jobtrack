import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useAuth } from '../../context/AuthContext';
import {
  Send,
  Activity,
  CalendarCheck,
  Award,
  ArrowRight,
  Calendar,
  Clock,
  MoreVertical,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileCheck,
  Info,
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import type { ApplicationStatus } from '../../types/database.types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();

  const userDisplayName = user?.email ? user.email.split('@')[0] : 'Rayden';

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Accepted':
      case 'Offering':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50';
      case 'HR Interview':
      case 'Technical Test':
      case 'User Interview':
      case 'Final Interview':
        return 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 border-brand-200/60 dark:border-brand-800/50';
      case 'Applied':
      case 'Screening':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/50';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  const momentum = stats?.momentum;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const score = momentum?.score ?? 0;
  const strokeDashoffset = circumference - (circumference * score) / 100;

  const getMomentumThemeClasses = (theme?: 'emerald' | 'amber' | 'rose' | 'muted') => {
    switch (theme) {
      case 'emerald':
        return {
          stroke: 'stroke-emerald-500',
          text: 'text-emerald-600 dark:text-emerald-400',
          badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50',
          bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
        };
      case 'amber':
        return {
          stroke: 'stroke-amber-500',
          text: 'text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/50',
          bg: 'bg-amber-50/50 dark:bg-amber-950/20',
        };
      case 'rose':
        return {
          stroke: 'stroke-rose-500',
          text: 'text-rose-600 dark:text-rose-400',
          badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50',
          bg: 'bg-rose-50/50 dark:bg-rose-950/20',
        };
      default:
        return {
          stroke: 'stroke-slate-300 dark:stroke-slate-700',
          text: 'text-muted-foreground',
          badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
          bg: 'bg-slate-50 dark:bg-slate-900/20',
        };
    }
  };

  const momentumTheme = getMomentumThemeClasses(momentum?.colorTheme);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome Back, <span className="capitalize">{userDisplayName}</span>!
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Perjalanan karir Anda dimulai di sini. Pantau dan kelola seluruh lamaran pekerjaan secara terpusat.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/calendar"
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-muted transition"
          >
            <Calendar className="h-4 w-4 text-brand-600" />
            <span>Lihat Agenda</span>
          </Link>
          <Link
            to="/kanban"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-600/25 hover:from-brand-700 hover:to-indigo-700 transition"
          >
            <Activity className="h-4 w-4" />
            <span>Buka Kanban</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards Row (Inspired by design reference) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Applications (Violet Gradient Card) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 p-5 text-white shadow-xl shadow-brand-600/20 transition hover:shadow-2xl hover:shadow-brand-600/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-100">Total Applications Sent</span>
            <button
              onClick={() => navigate('/applications')}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {isLoading ? '...' : stats?.totalApplications ?? 0}
            </span>
          </div>
          <p className="mt-1 text-xs text-brand-200/90">Ikhtisar seluruh lamaran yang telah diajukan</p>
        </div>

        {/* Card 2: Active Applications */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Applications</span>
            <button
              onClick={() => navigate('/applications?status=active')}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40 transition"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {isLoading ? '...' : stats?.activeApplications ?? 0}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Proses rekrutmen yang sedang berjalan</p>
        </div>

        {/* Card 3: Waiting for Interview */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Waiting for Interview</span>
            <button
              onClick={() => navigate('/calendar')}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40 transition"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {isLoading ? '...' : stats?.interviewsCount ?? 0}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Tahapan wawancara & tes terjadwal</p>
        </div>

        {/* Card 4: Offer Received */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Offer Received</span>
            <button
              onClick={() => navigate('/applications?status=Offering')}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40 transition"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              {isLoading ? '...' : stats?.offersCount ?? 0}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Penawaran kerja resmi yang diterima</p>
        </div>
      </div>

      {/* Middle Section: Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on lg): Latest Application Status Table */}
        <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div>
              <h2 className="text-base font-bold text-foreground">Latest Application Status</h2>
              <p className="text-xs text-muted-foreground">Daftar lamaran terbaru dan status perkembangannya</p>
            </div>
            <Link
              to="/applications"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center gap-1"
            >
              <span>See All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground">
                  <th className="py-2.5 font-semibold">Nama Perusahaan</th>
                  <th className="py-2.5 font-semibold">Posisi</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold">Tanggal Melamar</th>
                  <th className="py-2.5 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Memuat data lamaran...
                    </td>
                  </tr>
                ) : stats?.recentApplications && stats.recentApplications.length > 0 ? (
                  stats.recentApplications.map((app) => (
                    <tr key={app.id} className="group hover:bg-muted/40 transition">
                      <td className="py-3 font-medium text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 font-bold text-brand-600 text-xs">
                            {app.company_name[0]?.toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{app.company_name}</span>
                            <span className="text-[11px] text-muted-foreground">{app.location || 'Remote'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-foreground font-medium">{app.job_position}</td>
                      <td className="py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                            getStatusBadge(app.status)
                          )}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">{formatDate(app.application_date)}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => navigate(`/applications/${app.id}`)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Lihat Detail"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Belum ada lamaran. Klik tombol <strong>+ Add Application</strong> untuk mulai mencatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1 Col on lg): Upcoming Schedule & Strength */}
        <div className="space-y-6">
          {/* Upcoming Schedule Widget */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-bold text-foreground">Upcoming Schedule</h3>
              </div>
              <Link to="/calendar" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                See All
              </Link>
            </div>

            <div className="mt-3 space-y-2.5">
              {stats?.upcomingEvents && stats.upcomingEvents.length > 0 ? (
                stats.upcomingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-start gap-3 rounded-xl border border-border/60 p-2.5 hover:bg-muted/40 transition"
                  >
                    <div className="flex flex-col items-center justify-center rounded-lg bg-brand-500/10 px-2.5 py-1 text-center shrink-0">
                      <span className="text-[10px] uppercase font-bold text-brand-600">
                        {new Date(evt.start_datetime).toLocaleDateString('id-ID', { month: 'short' })}
                      </span>
                      <span className="text-base font-extrabold text-foreground">
                        {new Date(evt.start_datetime).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-foreground truncate">{evt.title}</h4>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {evt.job_applications?.company_name} • {evt.event_type}
                      </p>
                      <p className="text-[10px] text-brand-600 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(evt.start_datetime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Tidak ada agenda wawancara terdekat.
                </div>
              )}
            </div>
          </div>

          {/* Application Pipeline Health / Strength Meter */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-bold text-foreground">Job Search Momentum</h3>
                {/* Tooltip Info */}
                <div className="relative group inline-flex items-center">
                  <button
                    type="button"
                    aria-label="Info perhitungan momentum"
                    className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-full hover:bg-muted"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex group-focus-within:flex flex-col w-56 p-2.5 rounded-xl bg-popover text-popover-foreground border border-border shadow-xl text-[11px] z-50 pointer-events-none">
                    <span className="font-semibold text-foreground mb-1">Kalkulasi Skor Momentum:</span>
                    <span className="text-muted-foreground">• 40% Rasio Lamaran Aktif</span>
                    <span className="text-muted-foreground">• 30% Follow-up Tepat Waktu</span>
                    <span className="text-muted-foreground">• 30% Kesiapan Jadwal Interview</span>
                  </div>
                </div>
              </div>
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                  isLoading ? 'bg-muted text-muted-foreground' : momentumTheme.badge
                )}
              >
                {isLoading ? '...' : `${momentum?.activeRatio ?? 0}% Active`}
              </span>
            </div>

            <div className="mt-4 flex flex-col items-center text-center">
              {/* Dynamic SVG Circular Progress Bar */}
              <div className={cn('relative flex h-24 w-24 items-center justify-center rounded-full', momentumTheme.bg)}>
                <svg className="h-24 w-24 -rotate-90 transform" viewBox="0 0 96 96">
                  {/* Background Track Circle */}
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className="stroke-muted/60 dark:stroke-muted/30"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  {/* Progress Indicator Circle */}
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className={cn('transition-all duration-700 ease-out', momentumTheme.stroke)}
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={isLoading ? circumference : strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className={cn('text-2xl font-black tracking-tight', momentumTheme.text)}>
                    {isLoading ? '...' : `${score}%`}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs font-semibold text-foreground">
                {isLoading ? 'Menghitung momentum...' : (momentum?.statusLabel || 'Belum Ada Aktivitas')}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[210px]">
                {isLoading
                  ? 'Menganalisis performa pipeline dan aktivitas...'
                  : (momentum?.statusDescription || 'Mulai catat lamaran pekerjaan Anda untuk melacak momentum.')}
              </p>
            </div>

            <div className="mt-4 space-y-2 border-t border-border/60 pt-3 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Follow-ups Selesai</span>
                <span className="font-semibold text-foreground">
                  {isLoading ? '...' : `${momentum?.followUpRatio ?? 0}%`}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Jadwal Terisi</span>
                <span className="font-semibold text-foreground">
                  {isLoading ? '...' : `${momentum?.scheduleRatio ?? 0}%`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
