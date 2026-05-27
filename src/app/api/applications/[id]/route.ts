import { NextResponse } from 'next/server';
import { getApplicationById, updateApplication, deleteApplication } from '@/lib/supabase';

interface Params { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  try {
    const app = await getApplicationById(params.id);
    if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(app);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const body = await request.json();
    const app = await updateApplication(params.id, body);
    return NextResponse.json(app);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await deleteApplication(params.id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
