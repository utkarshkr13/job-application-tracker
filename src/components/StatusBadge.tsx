import type { ApplicationStatus } from '@/types';
import { clsx } from 'clsx';

const configs: Record<ApplicationStatus, { label: string; className: string }> = {
  applied:     { label: 'Applied',     className: 'bg-blue-100 text-blue-700' },
  confirmed:   { label: 'Confirmed',   className: 'bg-green-100 text-green-700' },
  rejected:    { label: 'Rejected',    className: 'bg-red-100 text-red-700' },
  no_response: { label: 'No Response', className: 'bg-slate-100 text-slate-600' },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, className } = configs[status];
  return <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', className)}>{label}</span>;
}
