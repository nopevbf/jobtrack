export const MAX_ATTACHMENT_COUNT = 5;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'] as const;

export interface AttachmentItem {
  id: string;
  name: string;
  size: number;
  source: 'local' | 'library';
  file?: File;
  storagePath?: string;
  fileType?: string;
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.slice(lastDot).toLowerCase();
}

export function getMimeTypeFallback(filename: string, originalType?: string): string {
  if (originalType && originalType.trim().length > 0) {
    return originalType;
  }
  const ext = getFileExtension(filename);
  switch (ext) {
    case '.pdf':
      return 'application/pdf';
    case '.doc':
      return 'application/msword';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    default:
      return 'application/octet-stream';
  }
}

export function validateAttachmentFile(file: File): { valid: boolean; error?: string } {
  if (file.size === 0) {
    return {
      valid: false,
      error: 'Berkas kosong (0 byte) tidak dapat diunggah',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Ukuran berkas melebihi batas 10 MB',
    };
  }

  const ext = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext as any)) {
    return {
      valid: false,
      error: `Format berkas tidak didukung (${ext || 'tanpa ekstensi'}). Gunakan .pdf, .doc, .docx, .jpg, atau .png`,
    };
  }

  return { valid: true };
}

export function mergeAttachmentsPool(
  currentList: AttachmentItem[],
  incomingFiles: File[]
): { items: AttachmentItem[]; rejectedCount: number; warning?: string } {
  const result = [...currentList];
  let rejectedCount = 0;
  let warning: string | undefined;

  for (const file of incomingFiles) {
    // 1. Validasi berkas
    const validation = validateAttachmentFile(file);
    if (!validation.valid) {
      rejectedCount++;
      warning = validation.error;
      continue;
    }

    // 2. Cek apakah berkas dengan nama yang sama sudah ada di daftar
    const existingIndex = result.findIndex(
      (item) => item.name.toLowerCase() === file.name.toLowerCase()
    );

    if (existingIndex !== -1) {
      // Jika berkas sudah ada di daftar, kita abaikan file lokal baru ini (prioritaskan yang sudah ada)
      continue;
    }

    // 3. Cek batas maksimal kuota
    if (result.length >= MAX_ATTACHMENT_COUNT) {
      rejectedCount++;
      warning = `Maksimal ${MAX_ATTACHMENT_COUNT} berkas lampiran yang dapat disertakan`;
      continue;
    }

    // 4. Tambahkan berkas lokal baru
    result.push({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      source: 'local',
      file,
      fileType: getMimeTypeFallback(file.name, file.type),
    });
  }

  return {
    items: result,
    rejectedCount,
    warning,
  };
}

export function resolvePrimaryResume(
  items: AttachmentItem[],
  primaryId: string | null
): string | null {
  if (!primaryId) return null;
  const match = items.find((item) => item.id === primaryId);
  return match ? match.name : null;
}
