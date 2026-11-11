import React from 'react';
import { Menu, Search, Bell, Plus, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenAddModal: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenAddModal,
  isDark,
  toggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/80 px-4 sm:px-6 backdrop-blur-md transition-colors">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari perusahaan, posisi, atau catatan..."
            className="w-full rounded-xl border border-input bg-muted/40 pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/70 transition focus:border-brand-500 focus:bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground transition"
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <button
          title="Notifikasi Pengingat"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground transition"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-background" />
        </button>

        {/* Primary CTA Add Application Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-600/25 transition hover:from-brand-700 hover:to-indigo-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Application</span>
        </button>
      </div>
    </header>
  );
};
