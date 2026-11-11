import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplications, useUpdateApplicationStatus } from '../../hooks/useApplications';
import type { ApplicationStatus, Database } from '../../types/database.types';
import {
  Briefcase,
  Building2,
  Calendar,
  ChevronRight,
  MoreVertical,
  Plus,
  ArrowRightLeft,
  Loader2,
} from 'lucide-react';
import { formatDate, cn } from '../../lib/utils';
import { ApplicationFormModal } from '../../components/applications/ApplicationFormModal';

type JobApplicationRow = Database['public']['Tables']['job_applications']['Row'];

const KANBAN_STAGES: { id: ApplicationStatus; title: string; color: string }[] = [
  { id: 'Saved', title: 'Saved', color: 'border-slate-300 dark:border-slate-700' },
  { id: 'Applied', title: 'Applied', color: 'border-sky-400' },
  { id: 'Screening', title: 'Screening', color: 'border-amber-400' },
  { id: 'HR Interview', title: 'HR Interview', color: 'border-brand-500' },
  { id: 'Technical Test', title: 'Technical Test', color: 'border-purple-500' },
  { id: 'User Interview', title: 'User Interview', color: 'border-indigo-500' },
  { id: 'Final Interview', title: 'Final Interview', color: 'border-violet-500' },
  { id: 'Offering', title: 'Offering', color: 'border-emerald-400' },
  { id: 'Accepted', title: 'Accepted', color: 'border-emerald-600' },
  { id: 'Rejected', title: 'Rejected', color: 'border-rose-500' },
  { id: 'Withdrawn', title: 'Withdrawn', color: 'border-slate-400' },
];

export const KanbanPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: applications, isLoading, refetch } = useApplications();
  const updateStatusMutation = useUpdateApplicationStatus();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Drag and drop state
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

  const allApps = applications || [];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedAppId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (!appId) return;

    try {
      await updateStatusMutation.mutateAsync({ id: appId, status: targetStatus });
      refetch();
    } catch (err: any) {
      alert(`Gagal memindahkan kartu: ${err.message}`);
    } finally {
      setDraggedAppId(null);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Recruitment Kanban Pipeline
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Tarik dan lepas kartu lamaran untuk memperbarui tahapan rekrutmen secara otomatis.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-600/25 hover:from-brand-700 hover:to-indigo-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Kanban Board Container (Horizontal Scroll) */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max pb-2">
          {KANBAN_STAGES.map((stage) => {
            const stageApps = allApps.filter((a) => a.status === stage.id);

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className="flex flex-col w-72 rounded-2xl border border-border/80 bg-muted/20 p-3 shadow-sm transition hover:border-brand-500/30"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2.5 w-2.5 rounded-full border-2', stage.color)} />
                    <h3 className="text-xs font-bold text-foreground">{stage.title}</h3>
                  </div>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border text-[11px] font-bold text-muted-foreground">
                    {stageApps.length}
                  </span>
                </div>

                {/* Cards List in Column */}
                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                  {stageApps.map((app) => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app.id)}
                      onClick={() => navigate(`/applications/${app.id}`)}
                      className="group cursor-grab active:cursor-grabbing rounded-xl border border-border/80 bg-card p-3.5 shadow-sm transition-all hover:border-brand-500 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 font-bold text-brand-600 text-xs">
                            {app.company_name[0]?.toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-foreground line-clamp-1">
                            {app.company_name}
                          </span>
                        </div>
                        <span
                          className={cn(
                            'text-[10px] font-semibold px-2 py-0.5 rounded-md',
                            app.priority === 'Top Priority'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40'
                              : app.priority === 'High'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {app.priority}
                        </span>
                      </div>

                      <h4 className="mt-2 text-xs font-medium text-foreground line-clamp-1">
                        {app.job_position}
                      </h4>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(app.application_date)}
                        </span>
                        {app.follow_up_date && (
                          <span className="font-semibold text-brand-600 text-[10px]">
                            Follow-up: {formatDate(app.follow_up_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {stageApps.length === 0 && (
                    <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-border/80 text-[11px] text-muted-foreground/60">
                      Tarik lamaran ke sini
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isAddModalOpen && (
        <ApplicationFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
};
