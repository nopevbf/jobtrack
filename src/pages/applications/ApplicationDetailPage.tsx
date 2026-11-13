import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useApplication, useUpdateApplicationStatus, useDeleteApplication } from '../../hooks/useApplications';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Briefcase,
  ArrowLeft,
  Calendar,
  DollarSign,
  Globe,
  ExternalLink,
  Mail,
  Phone,
  User,
  Clock,
  Plus,
  Trash2,
  Upload,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Pencil,
  Check,
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import type { ApplicationStatus } from '../../types/database.types';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: rawApp, isLoading, refetch } = useApplication(id);
  const app = rawApp as any;
  const updateStatusMutation = useUpdateApplicationStatus();
  const deleteMutation = useDeleteApplication();

  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'notes' | 'attachments'>('overview');

  // Catatan baru
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Edit Catatan Awal Lamaran (app.notes)
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Upload attachment state
  const [isUploading, setIsUploading] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">Memuat rincian lamaran...</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="text-lg font-bold text-foreground">Lamaran Tidak Ditemukan</h3>
        <p className="text-xs text-muted-foreground mt-1">Data mungkin telah dihapus atau Anda tidak memiliki akses.</p>
        <Link to="/applications" className="mt-4 text-xs font-semibold text-brand-600 hover:underline">
          Kembali ke Daftar Lamaran
        </Link>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!id) return;
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      refetch();
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm(`Hapus permanen lamaran ${app.company_name}?`)) {
      await deleteMutation.mutateAsync(id);
      navigate('/applications', { replace: true });
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !user || !id) return;

    setIsSubmittingNote(true);
    try {
      const { error } = await supabase.from('application_notes').insert({
        user_id: user.id,
        application_id: id,
        content: newNoteContent.trim(),
      });
      if (error) throw error;
      setNewNoteContent('');
      refetch();
    } catch (err: any) {
      alert(`Gagal menambahkan catatan: ${err.message}`);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!id) return;
    setIsSavingNotes(true);
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ notes: editedNotes.trim() || null })
        .eq('id', id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['job_application', id] });
      setIsEditingNotes(false);
      refetch();
    } catch (err: any) {
      alert(`Gagal memperbarui catatan: ${err.message}`);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !id) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file melebihi batas maksimal 10 MB.');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const storagePath = `${user.id}/${id}/${Date.now()}_${file.name}`;

      // 1. Upload ke private bucket job-attachments
      const { error: uploadError } = await supabase.storage
        .from('job-attachments')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // 2. Simpan metadata ke tabel application_attachments
      const { error: metaError } = await supabase.from('application_attachments').insert({
        user_id: user.id,
        application_id: id,
        file_name: file.name,
        storage_path: storagePath,
        file_type: file.type || fileExt || 'unknown',
        file_size: file.size,
      });

      if (metaError) throw metaError;
      refetch();
    } catch (err: any) {
      alert(`Gagal mengunggah file: ${err.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDownloadAttachment = async (storagePath: string) => {
    try {
      // Buat signed URL (berlaku 60 detik)
      const { data, error } = await supabase.storage
        .from('job-attachments')
        .createSignedUrl(storagePath, 60);

      if (error || !data) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (err: any) {
      alert(`Gagal mengunduh file: ${err.message}`);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string, storagePath: string) => {
    if (!window.confirm('Hapus berkas lampiran ini?')) return;
    try {
      const { count, error: countErr } = await supabase
        .from('application_attachments')
        .select('*', { count: 'exact', head: true })
        .eq('storage_path', storagePath);

      if (countErr) throw countErr;

      const { error: dbError } = await supabase
        .from('application_attachments')
        .delete()
        .eq('id', attachmentId);

      if (dbError) throw dbError;

      // Hanya hapus berkas fisik jika tidak dipakai oleh lamaran lain
      if (count !== null && count <= 1) {
        await supabase.storage.from('job-attachments').remove([storagePath]);
      }

      queryClient.invalidateQueries({ queryKey: ['job_application', id] });
      queryClient.invalidateQueries({ queryKey: ['all_attachments'] });
      queryClient.invalidateQueries({ queryKey: ['user_library_documents'] });
    } catch (err: any) {
      alert(`Gagal menghapus berkas: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar Lamaran</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 font-extrabold text-white text-xl shadow-md shadow-brand-500/20">
              {app.company_name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {app.job_position}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                  {app.employment_type}
                </span>
              </div>
              <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                {app.company_name}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                <span>{app.work_arrangement}</span>
                <span>•</span>
                <span>{app.location || 'Remote'}</span>
                <span>•</span>
                <span>Melamar: {formatDate(app.application_date)}</span>
                {app.job_source && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-foreground">Sumber: {app.job_source}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Status Changer */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                Status Saat Ini
              </label>
              <select
                value={app.status}
                onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
                className="rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-brand-600 dark:text-brand-400 focus:border-brand-500 focus:outline-none"
              >
                <option value="Saved">Saved</option>
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="HR Interview">HR Interview</option>
                <option value="Technical Test">Technical Test</option>
                <option value="User Interview">User Interview</option>
                <option value="Final Interview">Final Interview</option>
                <option value="Offering">Offering</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>

            <button
              onClick={handleDelete}
              className="mt-4 rounded-xl border border-destructive/30 p-2.5 text-destructive hover:bg-destructive/10 transition"
              title="Hapus Lamaran"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 border-t border-border/80 mt-6 pt-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'pb-1.5 transition border-b-2',
              activeTab === 'overview'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Ikhtisar & Gaji
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={cn(
              'pb-1.5 transition border-b-2',
              activeTab === 'timeline'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Riwayat Status ({app.application_status_history?.length ?? 0})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={cn(
              'pb-1.5 transition border-b-2',
              activeTab === 'notes'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Catatan Aktivitas ({app.application_notes?.length ?? 0})
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={cn(
              'pb-1.5 transition border-b-2',
              activeTab === 'attachments'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Dokumen & Lampiran ({app.application_attachments?.length ?? 0})
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Salary & Priority Box */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">Informasi Kompensasi & Prioritas</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-muted-foreground block text-[11px]">Ekspektasi Gaji</span>
                <span className="text-base font-extrabold text-foreground mt-0.5 block">
                  {formatCurrency(app.expected_salary, app.currency)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-muted-foreground block text-[11px]">Gaji Ditawarkan</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {formatCurrency(app.offered_salary, app.currency)}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2">
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Prioritas:</span>
                <span className="font-semibold text-foreground">{app.priority}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Jadwal Follow-up:</span>
                <span className="font-semibold text-foreground">{formatDate(app.follow_up_date)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Versi Resume Digunakan:</span>
                <span className="font-semibold text-foreground">{app.resume_version || 'Default CV'}</span>
              </div>
            </div>
          </div>

          {/* Links & Recruiter Contact */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">Kontak & Tautan Terkait</h3>
            <div className="space-y-3 text-xs">
              {app.company_website && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4 shrink-0 text-brand-600" />
                  <a
                    href={app.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:underline truncate"
                  >
                    {app.company_website}
                  </a>
                </div>
              )}
              {app.job_url && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ExternalLink className="h-4 w-4 shrink-0 text-brand-600" />
                  <a
                    href={app.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:underline truncate"
                  >
                    Buka Halaman Lowongan Kerja
                  </a>
                </div>
              )}
              {app.recruiter_name && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4 shrink-0 text-brand-600" />
                  <span className="text-foreground font-medium">{app.recruiter_name}</span>
                </div>
              )}
              {app.recruiter_email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0 text-brand-600" />
                  <a href={`mailto:${app.recruiter_email}`} className="text-foreground hover:underline">
                    {app.recruiter_email}
                  </a>
                </div>
              )}
              {app.recruiter_phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0 text-brand-600" />
                  <span className="text-foreground">{app.recruiter_phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Timeline / Status History */}
      {activeTab === 'timeline' && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">Riwayat Perjalanan Rekrutmen</h3>
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {app.application_status_history && app.application_status_history.length > 0 ? (
              app.application_status_history.map((hist: any) => (
                <div key={hist.id} className="relative">
                  <div className="absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-brand-600" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{hist.new_status}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(hist.changed_at).toLocaleString('id-ID')}
                      </span>
                    </div>
                    {hist.notes && <p className="text-xs text-muted-foreground mt-1">{hist.notes}</p>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">Belum ada perubahan status yang tercatat.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab: Notes */}
      {activeTab === 'notes' && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
          {/* Catatan Awal Lamaran (app.notes) */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-600" />
                <h4 className="text-xs font-bold text-foreground">Catatan Awal Lamaran</h4>
              </div>
              {!isEditingNotes && (
                <button
                  type="button"
                  onClick={() => {
                    setEditedNotes(app.notes || '');
                    setIsEditingNotes(true);
                  }}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-brand-600 hover:bg-brand-500/10 transition"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>{app.notes ? 'Edit Catatan' : 'Tambah Catatan Awal'}</span>
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-2 pt-1">
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  placeholder="Poin penting tentang perusahaan, kisi-kisi, atau catatan awal..."
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:border-brand-500 focus:outline-none"
                  disabled={isSavingNotes}
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={isSavingNotes}
                    onClick={() => setIsEditingNotes(false)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isSavingNotes}
                    onClick={handleSaveNotes}
                    className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {isSavingNotes ? (
                      <span>Menyimpan...</span>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Simpan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : app.notes ? (
              <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed bg-background/60 p-3 rounded-lg border border-border/40">
                {app.notes}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic py-1">
                Belum ada catatan awal yang disertakan saat pembuatan lamaran.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-border/60">
            <h3 className="text-sm font-bold text-foreground mb-3">Catatan & Evaluasi Wawancara</h3>
          </div>

          {/* Form input note */}
          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Tuliskan poin hasil interview, feedback, atau pertanyaan untuk follow-up..."
              rows={3}
              className="w-full rounded-xl border border-input bg-background p-3 text-xs focus:border-brand-500 focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingNote || !newNoteContent.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Catatan</span>
              </button>
            </div>
          </form>

          {/* List Notes */}
          <div className="space-y-3 divide-y divide-border/60">
            {app.application_notes && app.application_notes.length > 0 ? (
              app.application_notes.map((note: any) => (
                <div key={note.id} className="pt-3 first:pt-0">
                  <p className="text-xs text-foreground whitespace-pre-wrap">{note.content}</p>
                  <span className="text-[10px] text-muted-foreground block mt-1">
                    {new Date(note.created_at).toLocaleString('id-ID')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                Belum ada catatan aktivitas.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab: Attachments */}
      {activeTab === 'attachments' && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Dokumen & Lampiran Lamaran</h3>
            <label className="flex items-center gap-1.5 cursor-pointer rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700">
              <Upload className="h-4 w-4" />
              <span>{isUploading ? 'Mengunggah...' : 'Upload Dokumen'}</span>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.png"
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>

          <p className="text-xs text-muted-foreground">
            Didukung: PDF, DOC, DOCX, JPG, PNG (Maks 10 MB). File tersimpan aman di private storage.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {app.application_attachments && app.application_attachments.length > 0 ? (
              app.application_attachments.map((file: any) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText className="h-5 w-5 text-brand-600 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-foreground truncate">{file.file_name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {(file.file_size / (1024 * 1024)).toFixed(2)} MB • {formatDate(file.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleDownloadAttachment(file.storage_path)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-brand-50 hover:text-brand-600"
                      title="Unduh / Pratinjau Berkas"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAttachment(file.id, file.storage_path)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Hapus Berkas"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                Belum ada berkas terlampir untuk lamaran ini.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
