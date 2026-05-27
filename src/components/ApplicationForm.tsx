'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Application, ApplicationStatus, ApplicationSource } from '@/types';

interface Props { existing?: Application; }

export function ApplicationForm({ existing }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    company: existing?.company ?? '', position: existing?.position ?? '',
    applied_date: existing?.applied_date ?? new Date().toISOString().split('T')[0],
    status: (existing?.status ?? 'applied') as ApplicationStatus,
    source: (existing?.source ?? 'manual') as ApplicationSource,
    job_url: existing?.job_url ?? '', notes: existing?.notes ?? '',
  });

  function set(key: keyof typeof form, value: string) { setForm(f => ({ ...f, [key]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      const res = await fetch(existing ? `/api/applications/${existing.id}` : '/api/applications', {
        method: existing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, job_url: form.job_url || null, notes: form.notes || null }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Error'); }
      router.push('/applications'); router.refresh();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[{key:'company',label:'Company',placeholder:'Acme Corp',type:'text',required:true},{key:'position',label:'Role / Position',placeholder:'Software Engineer',type:'text',required:true}].map(f => (
          <div key={f.key} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">{f.label} {f.required && <span className="text-red-500">*</span>}</label>
            <input type={f.type} required={f.required} value={form[f.key as keyof typeof form] as string} onChange={e => set(f.key as keyof typeof form, e.target.value)} placeholder={f.placeholder} className="input" />
          </div>
        ))}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Applied Date <span className="text-red-500">*</span></label>
          <input type="date" required value={form.applied_date} onChange={e => set('applied_date', e.target.value)} className="input" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} className="input">
            <option value="applied">Applied</option>
            <option value="confirmed">Confirmed (Interview/Offer)</option>
            <option value="rejected">Rejected</option>
            <option value="no_response">No Response</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Source</label>
          <select value={form.source} onChange={e => set('source', e.target.value)} className="input">
            <option value="manual">Manual</option>
            <option value="gmail">Gmail</option>
            <option value="outlook">Outlook</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Job Listing URL</label>
          <input type="url" value={form.job_url} onChange={e => set('job_url', e.target.value)} placeholder="https://..." className="input" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Notes</label>
        <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Recruiter name, referral, interview notes…" className="input resize-none" />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {loading ? 'Saving…' : existing ? 'Save Changes' : 'Add Application'}
        </button>
        <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
      </div>
    </form>
  );
}
