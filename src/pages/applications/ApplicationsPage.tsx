import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplications, useDeleteApplication } from '../../hooks/useApplications';
import {
  Search,
  Download,
  Plus,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import { formatEmploymentType, buildApplicationsCsvContent } from '../../lib/applications';
import type { ApplicationStatus } from '../../types/database.types';
import { ApplicationFormModal } from '../../components/applications/ApplicationFormModal';

export const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: applications, isLoading } = useApplications({
    search,
    status: statusFilter,
    priority: priorityFilter,
    employment_type: employmentTypeFilter,
  });

  const deleteMutation = useDeleteApplication();

  const allApps = applications || [];
  const totalPages = Math.ceil(allApps.length / pageSize) || 1;
  const paginatedApps = allApps.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDelete = async (id: string, company: string) => {
    if (window.confirm(`Hapus lamaran di ${company}? Data riwayat dan catatan terkait juga akan dihapus.`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        alert(`Gagal menghapus: ${err.message}`);
      }
    }
  };

  const exportToCSV = () => {
    if (allApps.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + buildApplicationsCsvContent(allApps);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jobtrack_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Accepted':
      case 'Offering':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50';
      case 'HR Interview':
      case 'Technical Test':
      case 'User Interview':
      case 'Final Interview':
        return 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 border-brand-200/60 dark:border-brand-800/50';
      case 'Applied':
      case 'Screening':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/50';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Job Applications
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Kelola, filter, dan telusuri seluruh berkas lamaran kerja Anda dalam satu tabel interaktif.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-muted transition"
          >
            <Download className="h-4 w-4 text-muted-foreground" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-600/25 hover:from-brand-700 hover:to-indigo-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari perusahaan, posisi jabatan, atau kata kunci..."
              className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/70 transition focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Filters (Tipe, Status, Prioritas) */}
          <div className="flex w-full md:w-auto items-center gap-2 flex-wrap">
            {/* Employment Type Filter */}
            <select
              value={employmentTypeFilter}
              onChange={(e) => {
                setEmploymentTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-brand-500 focus:outline-none"
            >
              <option value="all">Semua Tipe</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-brand-500 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="Saved">Saved</option>
              <option value="Applied">Applied</option>
              <option value="Screening">Screening</option>
              <option value="HR Interview">HR Interview</option>
              <option value="Technical Test">Technical Test</option>
              <option value="User Interview">User Interview</option>
              <option value="Final Interview">Final Interview</option>
              <option value="Offering">Offering</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-brand-500 focus:outline-none"
            >
              <option value="all">Semua Prioritas</option>
              <option value="Top Priority">Top Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/80 bg-muted/30 text-muted-foreground">
                <th className="py-3 px-4 font-semibold">Perusahaan</th>
                <th className="py-3 px-4 font-semibold">Posisi</th>
                <th className="py-3 px-4 font-semibold">Tipe Pekerjaan</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Prioritas</th>
                <th className="py-3 px-4 font-semibold">Gaji Harapan</th>
                <th className="py-3 px-4 font-semibold">Tanggal Melamar</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    Memuat data lamaran...
                  </td>
                </tr>
              ) : paginatedApps.length > 0 ? (
                paginatedApps.map((app) => (
                  <tr key={app.id} className="group hover:bg-muted/30 transition">
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 font-bold text-brand-600 text-sm">
                          {app.company_name[0]?.toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{app.company_name}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {app.work_arrangement} • {app.location || 'Remote'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {app.job_position}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center rounded-md border border-border/80 bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-foreground">
                        {formatEmploymentType(app.employment_type)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                          getStatusBadge(app.status)
                        )}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          'text-[11px] font-medium',
                          app.priority === 'Top Priority'
                            ? 'text-rose-600 font-bold'
                            : app.priority === 'High'
                            ? 'text-amber-600 font-semibold'
                            : 'text-muted-foreground'
                        )}
                      >
                        {app.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-foreground font-medium">
                      {formatCurrency(app.expected_salary, app.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {formatDate(app.application_date)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/applications/${app.id}`)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40"
                          title="Lihat Rincian"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id, app.company_name)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Hapus Lamaran"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    Tidak ada lamaran yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/80 text-xs text-muted-foreground">
          <div>
            Menampilkan{' '}
            <span className="font-semibold text-foreground">
              {allApps.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            -{' '}
            <span className="font-semibold text-foreground">
              {Math.min(currentPage * pageSize, allApps.length)}
            </span>{' '}
            dari <span className="font-semibold text-foreground">{allApps.length}</span> lamaran
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <ApplicationFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
};
