import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  User,
  Lock,
  Moon,
  Sun,
  DollarSign,
  Bell,
  Download,
  Upload,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, signOut } = useAuth();

  // Change password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Preference state
  const [theme, setTheme] = useState(() => localStorage.getItem('jobtrack_theme') || 'light');
  const [currency, setCurrency] = useState(() => localStorage.getItem('jobtrack_currency') || 'IDR');

  // Backup & Export JSON
  const [isExporting, setIsExporting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Kata sandi minimal 6 karakter.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Konfirmasi kata sandi tidak cocok.' });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordMsg({ type: 'success', text: 'Kata sandi berhasil diperbarui!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('jobtrack_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('jobtrack_theme', 'light');
    }
  };

  const handleCurrencyChange = (newCurr: string) => {
    setCurrency(newCurr);
    localStorage.setItem('jobtrack_currency', newCurr);
  };

  const handleExportAllData = async () => {
    setIsExporting(true);
    try {
      const [apps, notes, events, attachments] = await Promise.all([
        supabase.from('job_applications').select('*'),
        supabase.from('application_notes').select('*'),
        supabase.from('recruitment_events').select('*'),
        supabase.from('application_attachments').select('*'),
      ]);

      const backupObject = {
        exported_at: new Date().toISOString(),
        version: '1.0.0',
        job_applications: apps.data || [],
        application_notes: notes.data || [],
        recruitment_events: events.data || [],
        application_attachments: attachments.data || [],
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `jobtrack_full_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      alert(`Gagal mengekspor data: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const requestBrowserNotification = async () => {
    if (!('Notification' in window)) {
      alert('Browser Anda tidak mendukung Web Notifications.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification('JobTrack', {
        body: 'Notifikasi browser untuk jadwal interview berhasil diaktifkan!',
        icon: '/favicon.ico',
      });
    } else {
      alert('Izin notifikasi ditolak.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Workspace Settings
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Konfigurasi preferensi tampilan, keamanan kata sandi, dan cadangan data pribadi Anda.
        </p>
      </div>

      {/* Account Info */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <h2 className="text-sm font-bold text-foreground mb-4">Profil Pemilik Terdaftar</h2>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white font-bold text-lg">
            {user?.email ? user.email[0].toUpperCase() : 'O'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">{user?.email}</span>
            <span className="text-xs text-muted-foreground">User ID: {user?.id}</span>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Single-User Owner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security: Change Password */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <h2 className="text-sm font-bold text-foreground mb-1">Keamanan & Ubah Kata Sandi</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Perbarui kata sandi akun Supabase Anda secara aman.
        </p>

        {passwordMsg && (
          <div
            className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                : 'bg-destructive/10 text-destructive border border-destructive/20'
            }`}
          >
            {passwordMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3.5 max-w-sm text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">Kata Sandi Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full rounded-xl border border-input bg-background p-2.5 focus:border-brand-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-foreground mb-1">Ulangi Kata Sandi Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang kata sandi"
              className="w-full rounded-xl border border-input bg-background p-2.5 focus:border-brand-500 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {passwordLoading ? 'Memperbarui...' : 'Simpan Kata Sandi'}
          </button>
        </form>
      </div>

      {/* Preferences Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Theme Preferences */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-1">Tema Tampilan</h2>
          <p className="text-xs text-muted-foreground mb-3">Pilih mode tampilan favorit Anda</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-2 text-xs font-semibold ${
                theme === 'light'
                  ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300'
                  : 'border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              <Sun className="h-4 w-4" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-2 text-xs font-semibold ${
                theme === 'dark'
                  ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300'
                  : 'border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              <Moon className="h-4 w-4" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Currency Preferences */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-1">Mata Uang Default</h2>
          <p className="text-xs text-muted-foreground mb-3">Format penulisan gaji pada form</p>
          <select
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-semibold focus:border-brand-500 focus:outline-none"
          >
            <option value="IDR">IDR (Rp - Rupiah)</option>
            <option value="USD">USD ($ - US Dollar)</option>
            <option value="SGD">SGD (S$ - Singapore Dollar)</option>
            <option value="EUR">EUR (€ - Euro)</option>
          </select>
        </div>
      </div>

      {/* Notification Permission */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground">Izin Notifikasi Browser</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Menerima pop-up notifikasi sebelum jadwal interview dimulai saat tab dibuka.
          </p>
        </div>
        <button
          onClick={requestBrowserNotification}
          className="rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
        >
          Minta Izin
        </button>
      </div>

      {/* Backup & Export */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <h2 className="text-sm font-bold text-foreground mb-1">Cadangan Data Lengkap (Export JSON)</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Unduh salinan seluruh basis data lamaran, catatan, agenda, dan metadata lampiran dalam format JSON.
        </p>
        <button
          onClick={handleExportAllData}
          disabled={isExporting}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          <span>{isExporting ? 'Mengekspor...' : 'Export Semua Data (JSON)'}</span>
        </button>
      </div>

      {/* Sign Out Section */}
      <div className="pt-4 border-t border-border">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar dari Akun (Sign Out)</span>
        </button>
      </div>
    </div>
  );
};
