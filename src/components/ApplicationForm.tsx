'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Application, ApplicationStatus, ApplicationSource } from '@/types';
import { Send } from 'lucide-react';

function buildApplyMailtoLink(company: string, position: string, notes: string): string {
  const subject = `Application for ${position} at ${company}`;
  const body = [
    `Hi,`,
    ``,
    `I am writing to express my interest in the ${position} role at ${company}.`,
    ``,
    notes ? `${notes}\n` : ``,
    `I have attached my resume and cover letter for your review. I would love the opportunity to discuss how my skills and experience align with this role.`,
    ``,
    `Please feel free to reach out if you need any additional information.`,
    ``,
    `Looking forward to hearing from you.`,
    ``,
    `Best regards,`,
  ].filter((line, i, arr) => !(line === '' && arr[i - 1] === '')).join('\n');
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

interface Props {
  existing?: Application;
}

export function ApplicationForm({ existing }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    company:      existing?.company      ?? '',
    position:     existing?.position     ?? '',
    applied_date: existing?.applied_date ?? new Date().toISOString().split('T')[0],
    status:       (existing?.status      ?? 'applied') as ApplicationStatus,
    source:       (existing?.source      ?? 'manual')  as ApplicationSource,
    job_url:      existing?.job_url      ?? '',
    notes:        existing?.notes        ?? '',
  });

  function set(key: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method  = existing ? 'PUT' : 'POST';
      const url     = existing ? `/api/applications/${existing.id}` : '/api/applications';
      const payload = { ...form, job_url: form.job_url || null, notes: form.notes || null };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Something went wrong');
      }

      router.push('/applications');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Company *" required>
          <input
            type="text"
            required
            value={form.company}
            onChange={e => set('company', e.target.value)}
            placeholder="Acme Corp"
            className="input"
          />
        </Field>

        <Field label="Role / Position *" required>
          <input
            type="text"
            required
            value={form.position}
            onChange={e => set('position', e.target.value)}
            placeholder="Software Engineer"
            className="input"
          />
        </Field>

        <Field label="Applied Date *" required>
          <input
            type="date"
            required
            value={form.applied_date}
            onChange={e => set('applied_date', e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Status">
          <select value={form.status} onChange={e => set('status', e.target.value)} className="input">
            <option value="applied">Applied</option>
            <option value="confirmed">Confirmed (Interview/Offer)</option>
            <option value="rejected">Rejected</option>
            <option value="no_response">No Response</option>
          </select>
        </Field>

        <Field label="Source">
          <select value={form.source} onChange={e => set('source', e.target.value)} className="input">
            <option value="manual">Manual</option>
            <option value="gmail">Gmail</option>
            <option value="outlook">Outlook</option>
          </select>
        </Field>

        <Field label="Job Listing URL">
          <input
            type="url"
            value={form.job_url}
            onChange={e => set('job_url', e.target.value)}
            placeholder="https://..."
            className="input"
          />
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          rows={3}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Recruiter name, referral, interview notes…"
          className="input resize-none"
        />
      </Field>

      <div className="flex items-center gap-3 pt-2 flex-wrap">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving…' : existing ? 'Save Changes' : 'Add Application'}
        </button>

        {/* Apply by Email — opens mail app with application email pre-filled */}
        {(form.company || form.position) && (
          <a
            href={buildApplyMailtoLink(form.company, form.position, form.notes)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            title="Open your mail app with a pre-written application email"
          >
            <Send className="w-4 h-4" />
            Apply by Email
          </a>
        )}

        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
