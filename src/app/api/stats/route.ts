import { NextResponse } from 'next/server';
import { getStats } from '@/lib/supabase';

export async function GET() {
  try {
    return NextResponse.json(await getStats());
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
