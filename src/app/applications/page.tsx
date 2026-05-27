'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Application, ApplicationStatus } from '@/types';
import { ApplicationTable } from '@/components/ApplicationTable';
import { SyncButton } from '@/components/SyncButton';
import Link from 'next/link';
import { PlusCircle, RefreshCw } from 'lucide-react';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      setApplications(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this application?')) return;
    await fetch(`/api/applications/${id}`, { method: 'DELETE' });
    setApplications(a => a.filter(x => x.id !== id));
  }

  async function handleStatusChange(id: string, status: ApplicationStatus) {
    await fetch(`/api/applications/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setApplications(a => a.map(x => x.id === id ? { ...x, status } : x));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Applications</h1>
          <p className="text-slate-500 text-sm mt-1">{applications.length} total</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SyncButton source="gmail" onSyncComplete={load} />
          <SyncButton source="outlook" onSyncComplete={load} />
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm hover:bg-slate-50 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link href="/add" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
            <PlusCircle className="w-4 h-4" />
            Add Job
          </Link>
        </div>
      </div>
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 py-20 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      ) : (
        <ApplicationTable applications={applications} onDelete={handleDelete} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
