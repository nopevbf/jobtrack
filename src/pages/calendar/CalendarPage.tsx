import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useApplications } from '../../hooks/useApplications';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  Loader2,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { formatDate, cn } from '../../lib/utils';
import { DateInput } from '../../components/common/DateInput';
import type { Database } from '../../types/database.types';

type RecruitmentEventRow = Database['public']['Tables']['recruitment_events']['Row'];

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: applications } = useApplications();

  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [eventType, setEventType] = useState('HR Interview');
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('09:00');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch events
  const { data: events, isLoading } = useQuery({
    queryKey: ['recruitment_events'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('recruitment_events')
        .select(`
          *,
          job_applications (
            company_name,
            job_position
          )
        `)
        .order('start_datetime', { ascending: true });

      if (error) throw error;
      return (data || []) as any;
    },
    enabled: !!user,
  });

  const toggleEventCompleteMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const { error } = await supabase
        .from('recruitment_events')
        .update({ is_completed: isCompleted })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment_events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate || !user) return;

    setIsSubmitting(true);
    try {
      const fullIsoString = new Date(`${eventDate}T${eventTime || '09:00'}:00`).toISOString();
      const { error } = await supabase.from('recruitment_events').insert({
        user_id: user.id,
        application_id: selectedAppId || null,
        event_type: eventType,
        title: title.trim(),
        start_datetime: fullIsoString,
        location_or_link: locationOrLink.trim() || null,
        notes: notes.trim() || null,
      });

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['recruitment_events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      setIsAddEventOpen(false);
      setTitle('');
      setLocationOrLink('');
      setNotes('');
    } catch (err: any) {
      alert(`Gagal menambah agenda: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allEvents: any[] = events || [];
  const upcomingEvents = allEvents.filter((e: any) => !e.is_completed);
  const completedEvents = allEvents.filter((e: any) => e.is_completed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Interview & Recruitment Calendar
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Jadwalkan wawancara HR, tes teknis, sesi user interview, serta tenggat waktu penawaran kerja.
          </p>
        </div>
        <button
          onClick={() => setIsAddEventOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-600/25 hover:from-brand-700 hover:to-indigo-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Jadwal Baru</span>
        </button>
      </div>

      {/* Grid Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main List: Upcoming Events (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <h2 className="text-base font-bold text-foreground mb-1">Agenda Mendatang</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Daftar kegiatan wawancara dan tes rekrutmen yang aktif
            </p>

            <div className="space-y-3">
              {isLoading ? (
                <p className="py-8 text-center text-xs text-muted-foreground">Memuat jadwal...</p>
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.map((evt) => {
                  const evtDate = new Date(evt.start_datetime);
                  return (
                    <div
                      key={evt.id}
                      className="flex items-start gap-4 rounded-xl border border-border/80 bg-background/50 p-4 transition hover:border-brand-500/50 hover:shadow-sm"
                    >
                      {/* Date Badge */}
                      <div className="flex flex-col items-center justify-center rounded-xl bg-brand-500/10 px-3.5 py-2 text-center shrink-0">
                        <span className="text-[11px] uppercase font-bold text-brand-600">
                          {evtDate.toLocaleDateString('id-ID', { month: 'short' })}
                        </span>
                        <span className="text-xl font-extrabold text-foreground">
                          {evtDate.getDate()}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {evtDate.toLocaleDateString('id-ID', { weekday: 'short' })}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{evt.title}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                            {evt.event_type}
                          </span>
                        </div>

                        {evt.job_applications && (
                          <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-1">
                            {evt.job_applications.company_name} — {evt.job_applications.job_position}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-brand-600" />
                            {evtDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {evt.location_or_link && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-brand-600" />
                              <a
                                href={
                                  evt.location_or_link.startsWith('http')
                                    ? evt.location_or_link
                                    : `https://${evt.location_or_link}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-600 hover:underline truncate max-w-[200px]"
                              >
                                {evt.location_or_link}
                              </a>
                            </span>
                          )}
                        </div>

                        {evt.notes && (
                          <p className="text-xs text-muted-foreground mt-2 bg-muted/30 p-2 rounded-lg">
                            {evt.notes}
                          </p>
                        )}
                      </div>

                      {/* Action: Mark as completed */}
                      <button
                        onClick={() =>
                          toggleEventCompleteMutation.mutate({ id: evt.id, isCompleted: true })
                        }
                        className="rounded-lg p-2 text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 transition"
                        title="Tandai Selesai"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  Tidak ada agenda mendatang. Klik tombol <strong>+ Tambah Jadwal Baru</strong> di atas.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Completed Events Sidebar (1 col) */}
        <div>
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-1">Agenda yang Telah Selesai</h3>
            <p className="text-xs text-muted-foreground mb-4">Arsip wawancara & tes yang telah dilalui</p>

            <div className="space-y-2.5">
              {completedEvents.length > 0 ? (
                completedEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl border border-border/60 bg-muted/20 text-xs opacity-70"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground line-through">{evt.title}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(evt.start_datetime)}
                      </span>
                    </div>
                    {evt.job_applications && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {evt.job_applications.company_name}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">
                  Belum ada agenda yang diselesaikan.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add Event */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground">Tambah Agenda Rekrutmen</h3>
              <button
                onClick={() => setIsAddEventOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Kaitkan dengan Lamaran (Opsional)
                </label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-2.5 focus:border-brand-500 focus:outline-none"
                >
                  <option value="">-- Pilih Perusahaan --</option>
                  {applications?.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.company_name} — {a.job_position}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Tipe Agenda</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-2.5 focus:border-brand-500 focus:outline-none"
                >
                  <option value="HR Interview">HR Interview</option>
                  <option value="Technical Test">Technical Test</option>
                  <option value="User Interview">User Interview</option>
                  <option value="Final Interview">Final Interview</option>
                  <option value="Offer Deadline">Offer Deadline</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Judul Agenda <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Live Coding Session dengan Lead Engineer"
                  className="w-full rounded-xl border border-input bg-background p-2.5 focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DateInput
                  label="Tanggal Agenda"
                  required
                  value={eventDate}
                  onChange={setEventDate}
                />
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Jam / Waktu <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Tautan Meeting / Lokasi
                </label>
                <input
                  type="text"
                  value={locationOrLink}
                  onChange={(e) => setLocationOrLink(e.target.value)}
                  placeholder="Google Meet / Zoom URL / Kantor"
                  className="w-full rounded-xl border border-input bg-background p-2.5 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Catatan Persiapan</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Poin penting yang perlu dipersiapkan..."
                  rows={2}
                  className="w-full rounded-xl border border-input bg-background p-2.5 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-medium text-muted-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
