import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Lock, Mail, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn, sendPasswordReset } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State dialog forgot password
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Silakan masukkan email dan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email.trim(), password);
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Gagal masuk. Periksa kembali kredensial Anda.');
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (!forgotEmail.trim()) {
      setForgotError('Masukkan alamat email pemilik akun.');
      return;
    }

    setIsForgotLoading(true);
    const { error } = await sendPasswordReset(forgotEmail.trim());
    setIsForgotLoading(false);

    if (error) {
      setForgotError(error.message);
    } else {
      setForgotSuccess(true);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50/50 dark:bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-xl shadow-brand-500/5 transition-all">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-600/30">
              <Briefcase className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
              JobTrack
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Private Personal Job Application Tracker
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/50">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-pulse"></span>
              Single-User Authorized Workspace
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-3.5 text-sm text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Email Pemilik
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@example.com"
                  className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(true);
                    setForgotSuccess(false);
                    setForgotError(null);
                  }}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:from-brand-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memvalidasi Pemilik...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice Footer */}
          <div className="mt-8 pt-6 border-t border-border/60 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Aplikasi ini dilindungi oleh Row Level Security (RLS) PostgreSQL. Pendaftaran publik dinonaktifkan secara permanen.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Lupa Password */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground">Pemulihan Kata Sandi</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Tautan instruksi reset kata sandi akan dikirim ke email pemilik terdaftar.
            </p>

            {forgotSuccess ? (
              <div className="mt-4 flex flex-col items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-center text-sm text-green-700 dark:text-green-300">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <p className="font-medium">Email Pemulihan Terkirim!</p>
                <p className="text-xs text-muted-foreground">
                  Periksa kotak masuk email Anda dan ikuti tautan yang disertakan.
                </p>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="mt-3 w-full rounded-lg bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-700"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
                {forgotError && (
                  <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg">
                    {forgotError}
                  </div>
                )}
                <div>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Masukkan email Anda"
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="flex-1 rounded-xl border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="flex-1 rounded-xl bg-brand-600 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                  >
                    {isForgotLoading ? 'Mengirim...' : 'Kirim Tautan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
