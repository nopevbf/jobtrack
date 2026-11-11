import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobApplicationSchema, type JobApplicationFormValues } from '../../lib/validation';
import { useCreateApplication } from '../../hooks/useApplications';
import { X, Loader2, Building2, Briefcase, DollarSign, Calendar, User, Link as LinkIcon } from 'lucide-react';

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  isOpen,
  onClose,
}) => {
  const createMutation = useCreateApplication();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobApplicationFormValues>({
    resolver: zodResolver(jobApplicationSchema) as any,
    defaultValues: {
      company_name: '',
      job_position: '',
      company_website: '',
      job_url: '',
      job_source: 'LinkedIn',
      employment_type: 'Full-time',
      work_arrangement: 'Remote',
      location: '',
      application_date: new Date().toISOString().split('T')[0],
      status: 'Applied',
      priority: 'Medium',
      currency: 'IDR',
      notes: '',
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (values: JobApplicationFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      reset();
      onClose();
    } catch (err: any) {
      alert(`Gagal menyimpan lamaran: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Tambah Lamaran Pekerjaan</h2>
              <p className="text-xs text-muted-foreground">Catat detail lamaran baru ke dalam pipeline rekrutmen Anda.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
          {/* Company & Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Nama Perusahaan <span className="text-destructive">*</span>
              </label>
              <input
                {...register('company_name')}
                placeholder="Contoh: Gojek, Shopee, Google"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {errors.company_name && (
                <p className="text-[11px] text-destructive mt-1">{errors.company_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Posisi Pekerjaan <span className="text-destructive">*</span>
              </label>
              <input
                {...register('job_position')}
                placeholder="Contoh: Senior Frontend Engineer"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {errors.job_position && (
                <p className="text-[11px] text-destructive mt-1">{errors.job_position.message}</p>
              )}
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Status Tahapan</label>
              <select
                {...register('status')}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
              >
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
                <option value="No Response">No Response</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Prioritas</label>
              <select
                {...register('priority')}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Top Priority">Top Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Tanggal Melamar</label>
              <input
                type="date"
                {...register('application_date')}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* URLs & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Sumber Lowongan</label>
              <input
                {...register('job_source')}
                placeholder="LinkedIn, Glints, Jobstreet, Referral"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Website Perusahaan</label>
              <input
                {...register('company_website')}
                placeholder="https://company.com"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">URL Lowongan</label>
              <input
                {...register('job_url')}
                placeholder="https://linkedin.com/jobs/..."
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Work Mode & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Tipe Pekerjaan</label>
              <select
                {...register('employment_type')}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Skema Kerja</label>
              <select
                {...register('work_arrangement')}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Lokasi</label>
              <input
                {...register('location')}
                placeholder="Jakarta / Bandung / Singapore"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Salary & Follow-up */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Ekspektasi Gaji</label>
              <input
                type="number"
                {...register('expected_salary')}
                placeholder="20000000"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Mata Uang</label>
              <select
                {...register('currency')}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
              >
                <option value="IDR">IDR (Rp)</option>
                <option value="USD">USD ($)</option>
                <option value="SGD">SGD (S$)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Jadwal Follow-up</label>
              <input
                type="date"
                {...register('follow_up_date')}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Recruiter Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Nama Recruiter</label>
              <input
                {...register('recruiter_name')}
                placeholder="Nama HR / Recruiter"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Email Recruiter</label>
              <input
                type="email"
                {...register('recruiter_email')}
                placeholder="recruiter@company.com"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Telepon / WhatsApp</label>
              <input
                {...register('recruiter_phone')}
                placeholder="+62 812-xxxx-xxxx"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Catatan Tambahan</label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Poin penting tentang perusahaan, kisi-kisi wawancara, atau negosiasi..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Footer Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-600/25 hover:from-brand-700 hover:to-indigo-700 disabled:opacity-60"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Lamaran</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
