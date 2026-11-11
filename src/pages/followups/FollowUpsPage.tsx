import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApplications } from '../../hooks/useApplications';
import {
  BellRing,
  AlertCircle,
  Clock,
  Calendar,
  Building2,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { formatDate, cn } from '../../lib/utils';

export const FollowUpsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: applications, isLoading } = useApplications();

  const allApps = applications || [];
  const todayStr = new Date().toISOString().split('T')[0];

  // Filter lamaran yang memiliki tanggal follow up dan belum selesai
  const activeWithFollowUp = allApps.filter(
    (a) => a.follow_up_date && !['Accepted', 'Rejected', 'Withdrawn'].includes(a.status)
  );

  const overdue = activeWithFollowUp.filter((a) => a.follow_up_date! < todayStr);
  const dueToday = activeWithFollowUp.filter((a) => a.follow_up_date === todayStr);
  const upcoming = activeWithFollowUp.filter((a) => a.follow_up_date! > todayStr);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Follow-up Reminders
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Jangan biarkan lamaran Anda menggantung tanpa kabar. Pantau jadwal tindak lanjut dengan HR/Recruiter.
        </p>
      </div>

      {/* Overdue Section */}
      {overdue.length > 0 && (
        <div className="rounded-2xl border border-rose-300/60 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <h2 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              Jatuh Tempo (Perlu Segera Ditindaklanjuti) ({overdue.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {overdue.map((app) => (
              <div
                key={app.id}
                onClick={() => navigate(`/applications/${app.id}`)}
                className="cursor-pointer rounded-xl border border-rose-200/80 dark:border-rose-800/40 bg-card p-3.5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground truncate">{app.company_name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                    Lewat {app.follow_up_date}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{app.job_position}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/60">
                  <span>Status: {app.status}</span>
                  <span className="text-brand-600 font-semibold flex items-center gap-0.5">
                    Rincian <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Due Today */}
      <div className="rounded-2xl border border-amber-300/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-5 w-5 text-amber-600" />
          <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
            Jadwal Follow-up Hari Ini ({dueToday.length})
          </h2>
        </div>

        {dueToday.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dueToday.map((app) => (
              <div
                key={app.id}
                onClick={() => navigate(`/applications/${app.id}`)}
                className="cursor-pointer rounded-xl border border-amber-200/80 dark:border-amber-800/40 bg-card p-3.5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground truncate">{app.company_name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                    Hari Ini
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{app.job_position}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/60">
                  <span>Status: {app.status}</span>
                  <span className="text-brand-600 font-semibold flex items-center gap-0.5">
                    Rincian <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-3">Tidak ada jadwal follow-up untuk hari ini.</p>
        )}
      </div>

      {/* Upcoming Follow-ups */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <h2 className="text-sm font-bold text-foreground mb-1">Mendatang ({upcoming.length})</h2>
        <p className="text-xs text-muted-foreground mb-4">Agenda follow-up beberapa hari ke depan</p>

        {upcoming.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcoming.map((app) => (
              <div
                key={app.id}
                onClick={() => navigate(`/applications/${app.id}`)}
                className="cursor-pointer rounded-xl border border-border/80 bg-background/50 p-3.5 hover:border-brand-500/50 hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground truncate">{app.company_name}</span>
                  <span className="text-[10px] font-semibold text-brand-600">
                    {formatDate(app.follow_up_date)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{app.job_position}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                  <span>Status: {app.status}</span>
                  <span className="text-muted-foreground flex items-center gap-0.5">
                    Lihat <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-6">
            Belum ada jadwal follow-up mendatang yang disetel.
          </p>
        )}
      </div>
    </div>
  );
};
