import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  isoToDisplayDate,
  displayToIsoDate,
  isValidDisplayDate,
  cn,
} from '../../lib/utils';

interface DateInputProps {
  value?: string | null; // ISO YYYY-MM-DD
  onChange: (isoValue: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  label,
  required = false,
  error,
  disabled = false,
  className,
  id,
}) => {
  const [displayText, setDisplayText] = useState<string>(() => isoToDisplayDate(value));
  const [internalError, setInternalError] = useState<string | null>(null);
  const hiddenPickerRef = useRef<HTMLInputElement>(null);

  // Sinkronisasi saat value prop dari luar berubah (misal form reset)
  useEffect(() => {
    const formatted = isoToDisplayDate(value);
    setDisplayText(formatted);
    if (!formatted) {
      setInternalError(null);
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    // Bersihkan karakter non-angka dan non-slash
    raw = raw.replace(/[^\d/]/g, '');

    // Format otomatis saat pengguna mengetik angka (auto-masking)
    const digitsOnly = raw.replace(/\D/g, '');
    let formatted = '';
    if (digitsOnly.length > 0) {
      if (digitsOnly.length <= 2) {
        formatted = digitsOnly;
      } else if (digitsOnly.length <= 4) {
        formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
      } else {
        formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4, 8)}`;
      }
    } else {
      formatted = raw;
    }

    setDisplayText(formatted);

    if (!formatted) {
      setInternalError(null);
      onChange('');
      return;
    }

    // Jika sudah lengkap 10 karakter (DD/MM/YYYY)
    if (formatted.length === 10) {
      if (isValidDisplayDate(formatted)) {
        setInternalError(null);
        const iso = displayToIsoDate(formatted);
        onChange(iso);
      } else {
        setInternalError('Format tanggal tidak valid (DD/MM/YYYY)');
        onChange('');
      }
    } else {
      // Masih dalam proses ketik, jangan kirim error agresif tapi reset value ISO
      setInternalError(null);
      onChange('');
    }
  };

  const handleBlur = () => {
    if (displayText && displayText.length > 0 && displayText.length < 10) {
      setInternalError('Format tanggal harus lengkap DD/MM/YYYY');
    }
  };

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedIso = e.target.value; // YYYY-MM-DD
    if (selectedIso) {
      setDisplayText(isoToDisplayDate(selectedIso));
      setInternalError(null);
      onChange(selectedIso);
    }
  };

  const triggerNativePicker = () => {
    if (disabled) return;
    try {
      const pickerEl = hiddenPickerRef.current as HTMLInputElement | null;
      if (pickerEl) {
        if ('showPicker' in pickerEl && typeof (pickerEl as any).showPicker === 'function') {
          (pickerEl as any).showPicker();
        } else {
          pickerEl.focus();
        }
      }
    } catch {
      hiddenPickerRef.current?.focus();
    }
  };

  const displayedError = error || internalError;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-foreground mb-1">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          value={displayText}
          onChange={handleTextChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={10}
          disabled={disabled}
          className={cn(
            'w-full rounded-xl border border-input bg-background pl-3 pr-10 py-2 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50 transition-colors',
            displayedError && 'border-destructive focus:border-destructive focus:ring-destructive'
          )}
        />

        {/* Tombol Kalender Interaktif */}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={triggerNativePicker}
          title="Buka Kalender"
          className="absolute right-2.5 p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition disabled:opacity-40"
        >
          <CalendarIcon className="h-4 w-4" />
        </button>

        {/* Input kalender tersembunyi untuk memicu dialog visual pemilih tanggal native */}
        <input
          ref={hiddenPickerRef}
          type="date"
          value={value || ''}
          onChange={handleNativePickerChange}
          tabIndex={-1}
          className="sr-only pointer-events-none"
        />
      </div>

      {displayedError && (
        <p className="text-[11px] text-destructive mt-1 font-medium">{displayedError}</p>
      )}
    </div>
  );
};
