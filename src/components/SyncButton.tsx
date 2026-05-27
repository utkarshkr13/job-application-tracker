'use client';
import { useState } from 'react';
import { RefreshCw, Mail } from 'lucide-react';
import { clsx } from 'clsx';

interface SyncButtonProps { source: 'gmail' | 'outlook'; onSyncComplete?: (count: number) => void; }

export function SyncButton({ source, onSyncComplete }: SyncButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true); setResult(null);
    try {
      const res = await fetch(`/api/sync/${source}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Sync failed');
      setResult(`✓ ${data.total} found, ${data.inserted} new`);
      onSyncComplete?.(data.inserted);
    } catch (err: unknown) {
      setResult(`✗ ${err instanceof Error ? err.message : 'Sync failed'}`);
    } finally { setLoading(false); }
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={handleSync} disabled={loading}
        className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
          source === 'gmail' ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200',
          loading && 'opacity-60 cursor-not-allowed')}>
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
        {loading ? 'Syncing…' : source === 'gmail' ? 'Sync Gmail' : 'Sync Outlook'}
      </button>
      {result && <span className="text-xs text-slate-500">{result}</span>}
    </div>
  );
}
