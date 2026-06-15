'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Application, ApplicationStatus } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Pencil, Trash2, ExternalLink, ChevronUp, ChevronDown, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  applications: Application[];
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: ApplicationStatus) => void;
}

const STATUS_OPTIONS: ApplicationStatus[] = ['applied', 'confirmed', 'rejected', 'no_response'];

function buildMailtoLink(company: string, position: string, appliedDate: string): string {
  const subject = `Following up on my ${position} application at ${company}`;
  const body = [
    `Hi,`,
    ``,
    `I hope you're doing well. I applied for the ${position} position at ${company} on ${appliedDate} and wanted to follow up on the status of my application.`,
    ``,
    `I'm genuinely excited about this opportunity and would love to learn more about next steps or the timeline for the hiring process.`,
    ``,
    `Please let me know if you need any additional information from my end.`,
    ``,
    `Thank you for your time and consideration.`,
    ``,
    `Best regards,`,
  ].join('\n');
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function ApplicationTable({ applications, onDelete, onStatusChange }: Props) {
  const [sortKey, setSortKey] = useState<keyof Application>('applied_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  function toggleSort(key: keyof Application) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const filtered = applications
    .filter(a => filter === 'all' || a.status === filter)
    .filter(a =>
      search === '' ||
      a.company.toLowerCase().includes(search.toLowerCase()) ||
      a.position.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey] as string ?? '';
      const bv = b[sortKey] as string ?? '';
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  function SortIcon({ col }: { col: keyof Application }) {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3" />
      : <ChevronDown className="w-3 h-3" />;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search company or role…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 w-60"
        />
        <div className="flex gap-2">
          {(['all', ...STATUS_OPTIONS] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
              }`}
            >
              {s === 'all' ? 'All' : s === 'no_response' ? 'No Response' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <p className="text-lg">No applications found</p>
            <p className="text-sm mt-1">Try adjusting your filters or <Link href="/add" className="text-indigo-600 hover:underline">add one manually</Link></p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {[
                  { key: 'company',      label: 'Company' },
                  { key: 'position',     label: 'Role' },
                  { key: 'applied_date', label: 'Applied' },
                  { key: 'status',       label: 'Status' },
                  { key: 'source',       label: 'Source' },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key as keyof Application)}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none"
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      <SortIcon col={key as keyof Application} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(app => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{app.company}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate" title={app.position}>{app.position}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {app.applied_date ? format(new Date(app.applied_date), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={app.status}
                      onChange={e => onStatusChange?.(app.id, e.target.value as ApplicationStatus)}
                      className="text-xs border-0 bg-transparent focus:outline-none focus:ring-0 cursor-pointer"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>
                          {s === 'no_response' ? 'No Response' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-400 capitalize">{app.source}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {/* Follow-up email — opens native mail app with pre-filled subject + body */}
                      <a
                        href={buildMailtoLink(
                          app.company,
                          app.position,
                          app.applied_date ? format(new Date(app.applied_date), 'MMM d, yyyy') : 'recently',
                        )}
                        title="Follow up by email"
                        className="p-1.5 rounded hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                      {app.job_url && (
                        <a href={app.job_url} target="_blank" rel="noreferrer"
                          title="Open job posting"
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <Link href={`/add?id=${app.id}`}
                        title="Edit"
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => onDelete?.(app.id)}
                        title="Delete"
                        className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
