import React from 'react';
import { useApplications } from '../../hooks/useApplications';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Percent,
  Award,
  XCircle,
  Clock,
  Layers,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#64748B'];

export const AnalyticsPage: React.FC = () => {
  const { data: applications, isLoading } = useApplications();
  const allApps = applications || [];

  const total = allApps.length;

  // 1. Interview Conversion Rate (Lamaran yang sampai ke tahap wawancara)
  const interviewStages = ['HR Interview', 'Technical Test', 'User Interview', 'Final Interview', 'Offering', 'Accepted'];
  const reachedInterview = allApps.filter((a) => interviewStages.includes(a.status)).length;
  const interviewRate = total > 0 ? Math.round((reachedInterview / total) * 100) : 0;

  // 2. Offer Conversion Rate
  const offers = allApps.filter((a) => ['Offering', 'Accepted'].includes(a.status)).length;
  const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;

  // 3. Rejection Rate
  const rejections = allApps.filter((a) => a.status === 'Rejected').length;
  const rejectionRate = total > 0 ? Math.round((rejections / total) * 100) : 0;

  // 4. Monthly Applications
  const monthlyMap: Record<string, number> = {};
  allApps.forEach((a) => {
    const monthKey = a.application_date.substring(0, 7); // YYYY-MM
    monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + 1;
  });
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month,
      jumlah: count,
    }));

  // 5. Applications by Status
  const statusMap: Record<string, number> = {};
  allApps.forEach((a) => {
    statusMap[a.status] = (statusMap[a.status] || 0) + 1;
  });
  const statusData = Object.entries(statusMap).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  // 6. Applications by Source
  const sourceMap: Record<string, number> = {};
  allApps.forEach((a) => {
    const s = a.job_source || 'Tidak Disebutkan';
    sourceMap[s] = (sourceMap[s] || 0) + 1;
  });
  const sourceData = Object.entries(sourceMap).map(([source, count]) => ({
    name: source,
    value: count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Recruitment Performance Analytics
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Evaluasi rasio konversi wawancara, tingkat penawaran kerja, dan pola saluran pencarian kerja Anda.
        </p>
      </div>

      {/* Metric Rates Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Interview Rate */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Interview Rate</span>
            <TrendingUp className="h-4 w-4 text-brand-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{interviewRate}%</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {reachedInterview} dari {total} lamaran tembus ke tahap wawancara
          </p>
        </div>

        {/* Offer Rate */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Offer Conversion Rate</span>
            <Award className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {offerRate}%
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {offers} tawaran kerja resmi diterima
          </p>
        </div>

        {/* Rejection Rate */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Rejection Rate</span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {rejectionRate}%
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {rejections} lamaran ditolak oleh perusahaan
          </p>
        </div>

        {/* Total Tracked */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Total Dilacak</span>
            <Layers className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{total}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Total seluruh berkas tersimpan di Supabase
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Trend */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-1">Aktivitas Melamar Bulanan</h2>
          <p className="text-xs text-muted-foreground mb-4">Volume lamaran yang dikirim per bulan</p>
          <div className="h-64 w-full">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="jumlah" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Belum ada data bulanan yang cukup.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Source Distribution */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-1">Distribusi Sumber Lowongan</h2>
          <p className="text-xs text-muted-foreground mb-4">Saluran lamaran (LinkedIn, Jobstreet, Referral, dsb.)</p>
          <div className="h-64 w-full flex items-center justify-center">
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sourceData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-muted-foreground">Belum ada data sumber.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
