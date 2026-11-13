import { describe, it, expect } from 'vitest';
import {
  validateAttachmentFile,
  mergeAttachmentsPool,
  resolvePrimaryResume,
  generateSequentialAttachmentName,
  MAX_ATTACHMENT_COUNT,
  MAX_FILE_SIZE_BYTES,
  type AttachmentItem,
} from '../lib/attachments';

describe('Attachment Validation & Management (TDD & ISTQB)', () => {
  describe('ISTQB BVA & EP: validateAttachmentFile', () => {
    it('ATT-EP-001: Menerima berkas valid (PDF, DOCX, PNG) dalam batas ukuran', () => {
      const validPdf = new File(['content'], 'cv.pdf', { type: 'application/pdf' });
      const validDocx = new File(['content'], 'surat.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const validPng = new File(['content'], 'porto.png', { type: 'image/png' });

      expect(validateAttachmentFile(validPdf)).toEqual({ valid: true });
      expect(validateAttachmentFile(validDocx)).toEqual({ valid: true });
      expect(validateAttachmentFile(validPng)).toEqual({ valid: true });
    });

    it('ATT-EP-002: Menolak format berkas terlarang (.zip, .exe, .js)', () => {
      const exeFile = new File(['binary'], 'virus.exe', { type: 'application/x-msdownload' });
      const zipFile = new File(['archive'], 'data.zip', { type: 'application/zip' });

      expect(validateAttachmentFile(exeFile)).toEqual({
        valid: false,
        error: 'Format berkas tidak didukung (.exe). Gunakan .pdf, .doc, .docx, .jpg, atau .png',
      });
      expect(validateAttachmentFile(zipFile)).toEqual({
        valid: false,
        error: 'Format berkas tidak didukung (.zip). Gunakan .pdf, .doc, .docx, .jpg, atau .png',
      });
    });

    it('ATT-BVA-001: Menolak berkas berukuran 0 byte (Zero-Byte Guard)', () => {
      const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' });
      expect(validateAttachmentFile(emptyFile)).toEqual({
        valid: false,
        error: 'Berkas kosong (0 byte) tidak dapat diunggah',
      });
    });

    it('ATT-BVA-002: Menerima berkas tepat batas 10 MB (10.485.760 bytes)', () => {
      const exactFile = {
        name: 'boundary.pdf',
        size: MAX_FILE_SIZE_BYTES, // 10 * 1024 * 1024
        type: 'application/pdf',
      } as File;

      expect(validateAttachmentFile(exactFile)).toEqual({ valid: true });
    });

    it('ATT-BVA-003: Menolak berkas 10 MB + 1 byte (10.485.761 bytes)', () => {
      const overFile = {
        name: 'too_large.pdf',
        size: MAX_FILE_SIZE_BYTES + 1,
        type: 'application/pdf',
      } as File;

      expect(validateAttachmentFile(overFile)).toEqual({
        valid: false,
        error: 'Ukuran berkas melebihi batas 10 MB',
      });
    });

    it('MIME Fallback: Mendeteksi format Word di Windows jika file.type browser kosong', () => {
      const winWordFile = new File(['content'], 'document.docx', { type: '' });
      expect(validateAttachmentFile(winWordFile)).toEqual({ valid: true });
    });
  });

  describe('ISTQB BVA & Error Guessing: mergeAttachmentsPool & Deduplication', () => {
    it('ATT-BVA-004: Menerima tepat batas maksimal 5 berkas gabungan', () => {
      const currentList: AttachmentItem[] = [
        { id: '1', name: 'doc1.pdf', size: 100, source: 'library', storagePath: 'path/1' },
        { id: '2', name: 'doc2.pdf', size: 100, source: 'library', storagePath: 'path/2' },
      ];
      const newFiles = [
        new File(['c'], 'doc3.pdf', { type: 'application/pdf' }),
        new File(['c'], 'doc4.pdf', { type: 'application/pdf' }),
        new File(['c'], 'doc5.pdf', { type: 'application/pdf' }),
      ];

      const result = mergeAttachmentsPool(currentList, newFiles);
      expect(result.items.length).toBe(MAX_ATTACHMENT_COUNT);
      expect(result.rejectedCount).toBe(0);
    });

    it('ATT-BVA-005: Menolak penambahan jika melebihi kuota 5 berkas', () => {
      const currentList: AttachmentItem[] = [
        { id: '1', name: 'doc1.pdf', size: 100, source: 'library', storagePath: 'path/1' },
        { id: '2', name: 'doc2.pdf', size: 100, source: 'library', storagePath: 'path/2' },
        { id: '3', name: 'doc3.pdf', size: 100, source: 'library', storagePath: 'path/3' },
        { id: '4', name: 'doc4.pdf', size: 100, source: 'library', storagePath: 'path/4' },
      ];
      const newFiles = [
        new File(['c'], 'doc5.pdf', { type: 'application/pdf' }),
        new File(['c'], 'doc6.pdf', { type: 'application/pdf' }),
      ];

      const result = mergeAttachmentsPool(currentList, newFiles);
      expect(result.items.length).toBe(5);
      expect(result.rejectedCount).toBe(1);
      expect(result.warning).toContain('Maksimal 5 berkas');
    });

    it('ATT-DUP-001: Mengutamakan berkas pustaka jika upload lokal bernama sama', () => {
      const currentList: AttachmentItem[] = [
        { id: 'lib-1', name: 'CV_Master.pdf', size: 500, source: 'library', storagePath: 'path/cv' },
      ];
      const duplicateLocal = [
        new File(['c'], 'CV_Master.pdf', { type: 'application/pdf' }),
        new File(['c'], 'Portofolio.pdf', { type: 'application/pdf' }),
      ];

      const result = mergeAttachmentsPool(currentList, duplicateLocal);
      expect(result.items.length).toBe(2);
      expect(result.items[0].source).toBe('library');
      expect(result.items[1].name).toBe('Portofolio.pdf');
    });
  });

  describe('Primary Resume Tracking & State Transition', () => {
    it('RESUME-001: Menghasilkan nama resume_version yang sesuai jika ada berkas ditandai', () => {
      const items: AttachmentItem[] = [
        { id: 'item-1', name: 'CV_Senior_2026.pdf', size: 1000, source: 'local', file: {} as File },
        { id: 'item-2', name: 'Porto.pdf', size: 2000, source: 'local', file: {} as File },
      ];

      const resumeName = resolvePrimaryResume(items, 'item-1');
      expect(resumeName).toBe('CV_Senior_2026.pdf');
    });

    it('RESUME-002: Mengembalikan null jika ID berkas CV utama tidak ditemukan dalam daftar', () => {
      const items: AttachmentItem[] = [
        { id: 'item-2', name: 'Porto.pdf', size: 2000, source: 'local', file: {} as File },
      ];

      const resumeName = resolvePrimaryResume(items, 'item-1'); // item-1 sudah dihapus
      expect(resumeName).toBeNull();
    });
  });

  describe('Clipboard Paste & Sequential Naming (TDD)', () => {
    it('PASTE-001: Menghasilkan dt_YYYYMMDD_0001 jika belum ada berkas di hari berjalan', () => {
      const fixedDate = new Date(2026, 10, 13); // 13 Nov 2026
      const items: AttachmentItem[] = [];

      const result = generateSequentialAttachmentName(items, '.png', fixedDate);
      expect(result).toBe('dt_20261113_0001.png');
    });

    it('PASTE-002: Menghasilkan nomor urut berikutnya (0002) jika 0001 sudah ada', () => {
      const fixedDate = new Date(2026, 10, 13);
      const items: AttachmentItem[] = [
        { id: '1', name: 'dt_20261113_0001.png', size: 100, source: 'local' },
        { id: '2', name: 'cv.pdf', size: 100, source: 'local' },
      ];

      const result = generateSequentialAttachmentName(items, '.png', fixedDate);
      expect(result).toBe('dt_20261113_0002.png');
    });

    it('PASTE-003: Menangani nomor urut tertinggi ketika ada nomor yang terlewat', () => {
      const fixedDate = new Date(2026, 10, 13);
      const items: AttachmentItem[] = [
        { id: '1', name: 'dt_20261113_0001.png', size: 100, source: 'local' },
        { id: '2', name: 'dt_20261113_0004.png', size: 100, source: 'local' },
      ];

      const result = generateSequentialAttachmentName(items, '.jpg', fixedDate);
      expect(result).toBe('dt_20261113_0005.jpg');
    });

    it('PASTE-004: Mengabaikan berkas dengan tanggal berbeda pada prefix', () => {
      const fixedDate = new Date(2026, 10, 13);
      const items: AttachmentItem[] = [
        { id: '1', name: 'dt_20261112_0009.png', size: 100, source: 'local' }, // Kemarin
      ];

      const result = generateSequentialAttachmentName(items, 'png', fixedDate);
      expect(result).toBe('dt_20261113_0001.png');
    });
  });
});
