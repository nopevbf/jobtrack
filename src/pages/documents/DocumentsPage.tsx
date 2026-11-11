import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useApplications } from '../../hooks/useApplications';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Calendar,
  Building2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';
import type { Database } from '../../types/database.types';

type AttachmentRow = Database['public']['Tables']['application_attachments']['Row'];

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: applications } = useApplications();

  const [selectedAppId, setSelectedAppId] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Ambil seluruh lampiran milik user
  const { data: attachments, isLoading } = useQuery({
    queryKey: ['all_attachments'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('application_attachments')
        .select(`
          *,
          job_applications (
            company_name,
            job_position
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as any;
    },
    enabled: !!user,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal 10 MB.');
      return;
    }

    if (!selectedAppId) {
      alert('Silakan pilih lamaran pekerjaan yang ingin dikaitkan dengan dokumen ini.');
      return;
    }

    setIsUploading(true);
    try {
      const storagePath = `${user.id}/${selectedAppId}/${Date.now()}_${file.name}`;

      // 1. Upload ke Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('job-attachments')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // 2. Simpan ke database
      const { error: dbError } = await supabase.from('application_attachments').insert({
        user_id: user.id,
        application_id: selectedAppId,
        file_name: file.name,
        storage_path: storagePath,
        file_type: file.type || 'document',
        file_size: file.size,
      });

      if (dbError) throw dbError;
      queryClient.invalidateQueries({ queryKey: ['all_attachments'] });
    } catch (err: any) {
      alert(`Gagal upload: ${err.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDownload = async (storagePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('job-attachments')
        .createSignedUrl(storagePath, 60);

      if (error || !data) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (err: any) {
      alert(`Gagal download: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, storagePath: string) => {
    if (window.confirm('Hapus dokumen ini secara permanen?')) {
      try {
        // Cek apakah ada record lain yang merujuk ke berkas fisik yang sama
        const { count, error: countErr } = await supabase
          .from('application_attachments')
          .select('*', { count: 'exact', head: true })
          .eq('storage_path', storagePath);

        if (countErr) throw countErr;

        // Hapus metadata baris ini
        const { error: dbError } = await supabase
          .from('application_attachments')
          .delete()
          .eq('id', id);

        if (dbError) throw dbError;

        // Hanya hapus fisik dari storage jika tidak ada referensi lain
        if (count !== null && count <= 1) {
          await supabase.storage.from('job-attachments').remove([storagePath]);
        }

        queryClient.invalidateQueries({ queryKey: ['all_attachments'] });
        queryClient.invalidateQueries({ queryKey: ['user_library_documents'] });
      } catch (err: any) {
        alert(`Gagal menghapus dokumen: ${err.message}`);
      }
    }
  };

  const allFiles: any[] = attachments || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Documents & Job Attachments
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Kelola berkas CV, portofolio, tugas take-home test, dan offering letter secara aman di storage terenkripsi.
        </p>
      </div>

      {/* Upload Box */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <h2 className="text-sm font-bold text-foreground mb-3">Upload Dokumen Baru</h2>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="w-full sm:w-80 rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
          >
            <option value="">-- Pilih Lamaran Terkait --</option>
            {applications?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.company_name} — {a.job_position}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-600/25 hover:from-brand-700 hover:to-indigo-700 transition">
            <Upload className="h-4 w-4" />
            <span>{isUploading ? 'Mengunggah...' : 'Pilih File (Maks 10 MB)'}</span>
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.png"
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* Document Grid */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <h2 className="text-sm font-bold text-foreground mb-4">Daftar Dokumen Tersimpan ({allFiles.length})</h2>

        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center py-10">Memuat berkas...</p>
        ) : allFiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allFiles.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-background/50 hover:border-brand-500/50 hover:shadow-sm transition"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-foreground truncate">{doc.file_name}</span>
                    <span className="text-[11px] text-muted-foreground truncate">
                      {doc.job_applications?.company_name || 'Umum'} • {(doc.file_size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <span className="text-[10px] text-muted-foreground">{formatDate(doc.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDownload(doc.storage_path)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40"
                    title="Download File"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id, doc.storage_path)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Hapus File"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
            Belum ada berkas lampiran yang diunggah.
          </div>
        )}
      </div>
    </div>
  );
};
