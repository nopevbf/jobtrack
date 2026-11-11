import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, cn } from '../lib/utils';

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

  describe('formatDate', () => {
    it('memformat string tanggal ISO menjadi format tanggal yang rapi', () => {
      const res = formatDate('2026-11-11');
      expect(res).toContain('2026');
      expect(res).toContain('11');
    });

    it('mengembalikan "-" jika tanggal kosong', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate(undefined)).toBe('-');
    });
  });

  describe('cn (Tailwind class merging)', () => {
    it('menggabungkan class dan menyelesaikan konflik tailwind', () => {
      const result = cn('px-2 py-1', 'bg-red-500', 'px-4');
      expect(result).toBe('py-1 bg-red-500 px-4');
    });
  });
});
