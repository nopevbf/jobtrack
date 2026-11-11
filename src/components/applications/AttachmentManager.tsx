import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  X,
  ExternalLink,
  Star,
  AlertCircle,
  FolderOpen,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  type AttachmentItem,
  MAX_ATTACHMENT_COUNT,
  mergeAttachmentsPool,
  getFileExtension,
} from '../../lib/attachments';
import { formatFileSize, formatDate, cn } from '../../lib/utils';
import type { Database } from '../../types/database.types';

type LibraryAttachment = Database['public']['Tables']['application_attachments']['Row'] & {
  job_applications?: {
    company_name: string;
    job_position: string;
  } | null;
};

interface AttachmentManagerProps {
  selectedItems: AttachmentItem[];
  onItemsChange: (items: AttachmentItem[]) => void;
  primaryResumeId: string | null;
  onPrimaryResumeChange: (id: string | null) => void;
  disabled?: boolean;
}

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({
  selectedItems,
  onItemsChange,
  primaryResumeId,
  onPrimaryResumeChange,
  disabled = false,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeObjectUrls = useRef<string[]>([]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      activeObjectUrls.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      });
      activeObjectUrls.current = [];
    };
  }, []);

  // Fetch dokumen yang sudah ada di pustaka milik user
  const { data: libraryDocs, isLoading: isLoadingLibrary } = useQuery<LibraryAttachment[]>({
    queryKey: ['user_library_documents', user?.id],
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
      return (data || []) as LibraryAttachment[];
    },
    enabled: !!user && activeTab === 'library',
  });

  // Handle local file selection
  const handleFilesAdded = (files: FileList | File[]) => {
    setValidationError(null);
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const { items, warning } = mergeAttachmentsPool(selectedItems, fileArray);
    if (warning) {
      setValidationError(warning);
    }
    onItemsChange(items);
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  // Toggle dokumen dari pustaka
  const handleToggleLibraryDoc = (doc: LibraryAttachment) => {
    setValidationError(null);
    const isSelected = selectedItems.some((item) => item.storagePath === doc.storage_path);

    if (isSelected) {
      // Hapus dari selectedItems
      const targetItem = selectedItems.find((item) => item.storagePath === doc.storage_path);
      if (targetItem && targetItem.id === primaryResumeId) {
        onPrimaryResumeChange(null);
      }
      onItemsChange(selectedItems.filter((item) => item.storagePath !== doc.storage_path));
    } else {
      // Periksa kuota
      if (selectedItems.length >= MAX_ATTACHMENT_COUNT) {
        setValidationError(`Maksimal ${MAX_ATTACHMENT_COUNT} berkas lampiran yang dapat disertakan.`);
        return;
      }

      // Periksa duplikasi nama file
      const existsSameName = selectedItems.some(
        (item) => item.name.toLowerCase() === doc.file_name.toLowerCase()
      );
      if (existsSameName) {
        setValidationError(`Berkas dengan nama "${doc.file_name}" sudah ada dalam daftar.`);
        return;
      }

      const newItem: AttachmentItem = {
        id: doc.id,
        name: doc.file_name,
        size: doc.file_size,
        source: 'library',
        storagePath: doc.storage_path,
        fileType: doc.file_type,
      };

      onItemsChange([...selectedItems, newItem]);
    }
  };

  // Hapus berkas dari daftar terpilih
  const handleRemoveItem = (itemToRemove: AttachmentItem) => {
    if (itemToRemove.id === primaryResumeId) {
      onPrimaryResumeChange(null);
    }
    onItemsChange(selectedItems.filter((item) => item.id !== itemToRemove.id));
  };

  // Pratinjau berkas di tab baru
  const handlePreviewItem = async (item: AttachmentItem) => {
    try {
      if (item.source === 'local' && item.file) {
        const objectUrl = URL.createObjectURL(item.file);
        activeObjectUrls.current.push(objectUrl);
        window.open(objectUrl, '_blank');
      } else if (item.source === 'library' && item.storagePath) {
        const { data, error } = await supabase.storage
          .from('job-attachments')
          .createSignedUrl(item.storagePath, 60);

        if (error || !data) throw error || new Error('Gagal membuat URL pratinjau');
        window.open(data.signedUrl, '_blank');
      }
    } catch (err: any) {
      alert(`Gagal membuka pratinjau: ${err.message}`);
    }
  };

  const getIconForFile = (filename: string) => {
    const ext = getFileExtension(filename);
    if (ext === '.pdf') return <FileText className="h-4 w-4 text-rose-500" />;
    if (['.jpg', '.jpeg', '.png'].includes(ext))
      return <ImageIcon className="h-4 w-4 text-emerald-500" />;
    return <FileIcon className="h-4 w-4 text-blue-500" />;
  };

  const canPreview = (filename: string) => {
    const ext = getFileExtension(filename);
    return ['.pdf', '.jpg', '.jpeg', '.png'].includes(ext);
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-foreground">
          Dokumen & Lampiran{' '}
          <span className="text-[11px] font-normal text-muted-foreground">
            ({selectedItems.length}/{MAX_ATTACHMENT_COUNT})
          </span>
        </label>
        {/* Tab switcher */}
        <div className="flex items-center rounded-lg bg-muted p-0.5 text-[11px] font-medium">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setActiveTab('upload');
              setValidationError(null);
            }}
            className={cn(
              'px-2.5 py-1 rounded-md transition-all',
              activeTab === 'upload'
                ? 'bg-card text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Upload Baru
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setActiveTab('library');
              setValidationError(null);
            }}
            className={cn(
              'px-2.5 py-1 rounded-md transition-all',
              activeTab === 'library'
                ? 'bg-card text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Pilih dari Pustaka
          </button>
        </div>
      </div>

      {validationError && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-2.5 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Tab 1: Upload Baru (Drag & Drop) */}
      {activeTab === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border border-dashed p-4 text-center cursor-pointer transition-all',
            isDragging
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-border bg-muted/20 hover:bg-muted/40 hover:border-brand-500/60',
            disabled && 'pointer-events-none opacity-60'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => {
              if (e.target.files) handleFilesAdded(e.target.files);
              e.target.value = '';
            }}
            className="hidden"
          />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 mb-1.5">
            <Upload className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold text-foreground">
            Seret & lepas berkas ke sini, atau <span className="text-brand-600 underline">pilih dari komputer</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Maks. 10 MB per berkas. Format: PDF, DOC, DOCX, JPG, PNG (Maks 5 berkas total)
          </p>
        </div>
      )}

      {/* Tab 2: Pilih dari Pustaka Tersimpan */}
      {activeTab === 'library' && (
        <div className="rounded-xl border border-border bg-card p-3 max-h-48 overflow-y-auto space-y-2">
          {isLoadingLibrary ? (
            <div className="flex items-center justify-center py-6 text-xs text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
              <span>Memuat pustaka dokumen...</span>
            </div>
          ) : !libraryDocs || libraryDocs.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              <FolderOpen className="h-6 w-6 mx-auto mb-1 text-muted-foreground/60" />
              <p>Belum ada dokumen tersimpan di pustaka.</p>
              <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                Silakan gunakan tab "Upload Baru" untuk mengunggah dokumen pertama Anda.
              </p>
            </div>
          ) : (
            libraryDocs.map((doc) => {
              const isSelected = selectedItems.some((item) => item.storagePath === doc.storage_path);
              return (
                <div
                  key={doc.id}
                  onClick={() => !disabled && handleToggleLibraryDoc(doc)}
                  className={cn(
                    'flex items-center justify-between rounded-lg p-2 text-xs border transition cursor-pointer',
                    isSelected
                      ? 'border-brand-500/50 bg-brand-50/50 dark:bg-brand-950/20'
                      : 'border-border/60 hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-background">
                      {isSelected ? (
                        <CheckCircle2 className="h-4 w-4 text-brand-600" />
                      ) : (
                        <div className="h-3 w-3 rounded-sm bg-muted" />
                      )}
                    </div>
                    {getIconForFile(doc.file_name)}
                    <div className="truncate">
                      <p className="font-medium text-foreground truncate">{doc.file_name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
                        {doc.job_applications?.company_name && (
                          <span className="ml-1 text-muted-foreground/80">
                            • {doc.job_applications.company_name}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Selected Attachments List */}
      {selectedItems.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Berkas Terpilih ({selectedItems.length})
          </p>
          <div className="space-y-1.5">
            {selectedItems.map((item) => {
              const isPrimary = item.id === primaryResumeId;
              const previewable = canPreview(item.name);

              return (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center justify-between rounded-xl border p-2 text-xs transition',
                    isPrimary
                      ? 'border-amber-500/40 bg-amber-500/5'
                      : 'border-border bg-card'
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0 mr-2">
                    {getIconForFile(item.name)}
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground truncate">{item.name}</span>
                        {isPrimary && (
                          <span className="shrink-0 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                            CV Utama
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {formatFileSize(item.size)} •{' '}
                        <span className="text-[10px] text-muted-foreground/90">
                          {item.source === 'library' ? 'Pustaka Tersimpan' : 'Upload Baru'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Jadikan CV Utama */}
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onPrimaryResumeChange(isPrimary ? null : item.id)}
                      title={isPrimary ? 'Batalkan status CV Utama' : 'Tandai sebagai CV/Resume Utama'}
                      className={cn(
                        'flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition',
                        isPrimary
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-muted-foreground hover:bg-muted hover:text-amber-600'
                      )}
                    >
                      <Star className={cn('h-3.5 w-3.5', isPrimary && 'fill-current')} />
                      <span className="hidden sm:inline">
                        {isPrimary ? 'CV Utama' : 'Set CV'}
                      </span>
                    </button>

                    {/* Preview Button */}
                    {previewable && (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handlePreviewItem(item)}
                        title="Buka pratinjau di tab baru"
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {/* Remove Button */}
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleRemoveItem(item)}
                      title="Batalkan berkas ini"
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
