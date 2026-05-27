import { clsx } from 'clsx';

interface StatCardProps {
  title: string; value: number; icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'slate' | 'indigo'; subtitle?: string;
}

const colorMap = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   icon: 'text-blue-500',   value: 'text-blue-700' },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  icon: 'text-green-500',  value: 'text-green-700' },
  red:    { bg: 'bg-red-50',    border: 'border-red-200',    icon: 'text-red-500',    value: 'text-red-700' },
  slate:  { bg: 'bg-slate-50',  border: 'border-slate-200',  icon: 'text-slate-500',  value: 'text-slate-700' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-500', value: 'text-indigo-700' },
};

export function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={clsx('rounded-xl border p-5 flex items-start gap-4', c.bg, c.border)}>
      <div className={clsx('mt-1 w-10 h-10 rounded-lg flex items-center justify-center bg-white shadow-sm', c.icon)}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
        <p className={clsx('text-3xl font-bold mt-0.5', c.value)}>{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
