import { getStats, getApplications } from '@/lib/supabase';
import { StatCard } from '@/components/StatCard';
import { SyncButton } from '@/components/SyncButton';
import { StatusBadge } from '@/components/StatusBadge';
import Link from 'next/link';
import { Briefcase, CheckCircle, XCircle, Clock, Send } from 'lucide-react';
import { format } from 'date-fns';

export const revalidate = 0;

export default async function DashboardPage() {
  const [stats, applications] = await Promise.all([getStats(), getApplications()]);
  const recent = applications.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Your job search at a glance</p>
        </div>
        <div className="flex gap-2">
          <SyncButton source="gmail" />
          <SyncButton source="outlook" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Applied" value={stats.total} icon={<Briefcase className="w-5 h-5" />} color="indigo" subtitle="all time" />
        <StatCard title="Confirmed" value={stats.confirmed} icon={<CheckCircle className="w-5 h-5" />} color="green" subtitle="interview or offer" />
        <StatCard title="Rejected" value={stats.rejected} icon={<XCircle className="w-5 h-5" />} color="red" subtitle="not moving forward" />
        <StatCard title="No Response" value={stats.no_response} icon={<Clock className="w-5 h-5" />} color="slate" subtitle="awaiting reply" />
      </div>

      {stats.total > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Response Rate</h2>
            <span className="text-xs text-slate-400">{Math.round(((stats.confirmed + stats.rejected) / stats.total) * 100)}% got a response</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
            {stats.confirmed > 0 && <div className="bg-green-400 h-full" style={{ width: `${(stats.confirmed / stats.total) * 100}%` }} />}
            {stats.applied > 0 && <div className="bg-blue-300 h-full" style={{ width: `${(stats.applied / stats.total) * 100}%` }} />}
            {stats.rejected > 0 && <div className="bg-red-300 h-full" style={{ width: `${(stats.rejected / stats.total) * 100}%` }} />}
            {stats.no_response > 0 && <div className="bg-slate-200 h-full" style={{ width: `${(stats.no_response / stats.total) * 100}%` }} />}
          </div>
          <div className="flex gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Confirmed</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-300 inline-block" /> Applied</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-300 inline-block" /> Rejected</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200 inline-block" /> No Response</span>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Recent Applications</h2>
          <Link href="/applications" className="text-sm text-indigo-600 hover:underline">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
            <Send className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No applications yet</p>
            <p className="text-sm text-slate-400 mt-1"><Link href="/add" className="text-indigo-600 hover:underline">Add one manually</Link> or sync your inbox above</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Applied</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{app.company}</td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-[180px]">{app.position}</td>
                    <td className="px-4 py-3 text-slate-500">{format(new Date(app.applied_date), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
