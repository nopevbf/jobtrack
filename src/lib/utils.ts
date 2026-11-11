import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined, currency: string = 'IDR'): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '-';
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency || 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

const ID_MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  const str = String(dateString).trim();
  if (!str) return '-';

  // Cegah timezone shift jika input berupa YYYY-MM-DD
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = match[1];
    const monthIdx = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${ID_MONTH_NAMES_SHORT[monthIdx]} ${year}`;
    }
  }

  try {
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return str;
  }
}

/**
 * Mengubah ISO string (YYYY-MM-DD) menjadi format tampilan input (DD/MM/YYYY)
 */
export function isoToDisplayDate(isoString: string | null | undefined): string {
  if (!isoString) return '';
  const match = String(isoString).trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return '';
  const year = match[1];
  const month = match[2].padStart(2, '0');
  const day = match[3].padStart(2, '0');
  return `${day}/${month}/${year}`;
}

/**
 * Mengubah format tampilan input (DD/MM/YYYY) menjadi format ISO (YYYY-MM-DD)
 */
export function displayToIsoDate(displayString: string | null | undefined): string {
  if (!displayString) return '';
  const match = String(displayString).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return '';
  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  const year = match[3];
  return `${year}-${month}-${day}`;
}

/**
 * Memvalidasi apakah string DD/MM/YYYY merupakan tanggal kalender yang valid
 */
export function isValidDisplayDate(displayString: string | null | undefined): boolean {
  if (!displayString) return false;
  const match = String(displayString).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return i === 0 ? `${Math.round(size)} ${units[i]}` : `${size.toFixed(1)} ${units[i]}`;
}
