import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  KanbanSquare,
  CalendarDays,
  BellRing,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/applications', label: 'Job Applications', icon: Briefcase },
  { to: '/kanban', label: 'Kanban Board', icon: KanbanSquare },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/follow-ups', label: 'Follow-ups', icon: BellRing },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const userInitial = user?.email ? user.email[0].toUpperCase() : 'O';
  const userDisplayName = user?.email ? user.email.split('@')[0] : 'Owner';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card/95 backdrop-blur-md transition-all duration-300 lg:static',
          isCollapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header / Brand */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/20">
              <Briefcase className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-foreground text-base">
                  JobTrack
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Personal Edition
                </span>
              </div>
            )}
          </div>

          {/* Desktop Toggle Collapse */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
            title={isCollapsed ? 'Perluas sidebar' : 'Kecilkan sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-2 mb-2">
            {!isCollapsed && (
              <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground/70">
                Menu Utama
              </span>
            )}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                        isActive
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-brand-600 dark:bg-brand-400" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Callout Card (Inspired by reference mockup) */}
        {!isCollapsed && (
          <div className="p-3 mx-3 mb-3 rounded-2xl bg-gradient-to-br from-brand-600/90 to-indigo-700 p-4 text-white shadow-lg shadow-brand-600/20 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="h-4 w-4 text-brand-200" />
              <span className="text-xs font-semibold text-brand-100 uppercase tracking-wide">
                Pro Tip
              </span>
            </div>
            <p className="text-xs font-medium text-white/90 leading-relaxed mb-3">
              Mastering interview STAR method can boost offering rate by 40%.
            </p>
            <NavLink
              to="/analytics"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition"
            >
              Lihat Funnel
            </NavLink>
          </div>
        )}

        {/* User Profile & Sign Out Footer */}
        <div className="p-3 border-t border-border/60">
          <div
            className={cn(
              'flex items-center justify-between rounded-xl p-2 transition hover:bg-muted/60',
              isCollapsed && 'justify-center p-1'
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold text-sm border border-brand-300/40">
                {userInitial}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {userDisplayName}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    Authorized Owner
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={handleSignOut}
                title="Keluar"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
