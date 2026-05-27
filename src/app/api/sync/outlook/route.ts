import { NextResponse } from 'next/server';
import { syncOutlook } from '@/lib/outlook';
import { upsertByEmailId } from '@/lib/supabase';

export async function POST() {
  try {
    const jobs = await syncOutlook(100);
    let inserted = 0, updated = 0;
    for (const job of jobs) {
      const result = await upsertByEmailId(job);
      if (result.created_at === result.updated_at) inserted++; else updated++;
    }
    return NextResponse.json({ success: true, total: jobs.length, inserted, updated });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
