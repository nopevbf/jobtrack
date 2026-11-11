import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatFileSize,
  isoToDisplayDate,
  displayToIsoDate,
  isValidDisplayDate,
  cn,
} from '../lib/utils';

describe('Utility Functions TDD', () => {
  describe('formatCurrency', () => {
    it('mengubah angka menjadi format IDR dengan benar', () => {
      expect(formatCurrency(15000000, 'IDR')).toContain('15.000.000');
    });

    it('menangani nilai null atau undefined dengan mengembalikan "-"', () => {
      expect(formatCurrency(null)).toBe('-');
      expect(formatCurrency(undefined)).toBe('-');
    });

    it('mendukung mata uang lain seperti USD', () => {
      const formatted = formatCurrency(5000, 'USD');
      expect(formatted).toMatch(/USD|US\$/);
    });
  });

  describe('formatDate (Output: Contoh 11 Nov 2026)', () => {
    it('memformat tanggal menjadi format nama bulan seperti 11 Nov 2026', () => {
      expect(formatDate('2026-11-11')).toBe('11 Nov 2026');
      expect(formatDate('2026-05-09')).toBe('9 Mei 2026');
      expect(formatDate('2026-01-01')).toBe('1 Jan 2026');
    });

    it('mengembalikan "-" jika tanggal kosong', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate(undefined)).toBe('-');
      expect(formatDate('')).toBe('-');
    });
  });

  describe('Konversi Tanggal Input (dd/mm/yyyy <-> yyyy-mm-dd)', () => {
    it('isoToDisplayDate mengubah yyyy-mm-dd menjadi dd/mm/yyyy', () => {
      expect(isoToDisplayDate('2026-11-11')).toBe('11/11/2026');
      expect(isoToDisplayDate('2026-05-09')).toBe('09/05/2026');
      expect(isoToDisplayDate('')).toBe('');
    });

    it('displayToIsoDate mengubah dd/mm/yyyy menjadi yyyy-mm-dd', () => {
      expect(displayToIsoDate('11/11/2026')).toBe('2026-11-11');
      expect(displayToIsoDate('09/05/2026')).toBe('2026-05-09');
      expect(displayToIsoDate('9/5/2026')).toBe('2026-05-09');
    });

    it('isValidDisplayDate memvalidasi keabsahan tanggal kalender', () => {
      expect(isValidDisplayDate('11/11/2026')).toBe(true);
      expect(isValidDisplayDate('31/02/2026')).toBe(false); // Februari tidak ada tgl 31
      expect(isValidDisplayDate('32/01/2026')).toBe(false); // Tanggal 32 tidak valid
      expect(isValidDisplayDate('15/13/2026')).toBe(false); // Bulan 13 tidak valid
      expect(isValidDisplayDate('abc')).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    it('memformat ukuran byte ke satuan yang mudah dibaca', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
    });
  });

  describe('cn (Tailwind class merging)', () => {
    it('menggabungkan class dan menyelesaikan konflik tailwind', () => {
      const result = cn('px-2 py-1', 'bg-red-500', 'px-4');
      expect(result).toBe('py-1 bg-red-500 px-4');
    });
  });
});
