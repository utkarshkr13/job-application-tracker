import { NextResponse } from 'next/server';
import { getApplications, createApplication } from '@/lib/supabase';

export async function GET() {
  try {
    const apps = await getApplications();
    return NextResponse.json(apps);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, position, applied_date, status, source, email_id, job_url, notes } = body;
    if (!company || !position || !applied_date) {
      return NextResponse.json({ error: 'company, position, and applied_date are required' }, { status: 400 });
    }
    const app = await createApplication({ company, position, applied_date, status: status ?? 'applied', source: source ?? 'manual', email_id: email_id ?? null, job_url: job_url ?? null, notes: notes ?? null });
    return NextResponse.json(app, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
