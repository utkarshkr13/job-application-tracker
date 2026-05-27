import { createClient } from '@supabase/supabase-js';
import type { Application } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey ?? supabaseAnonKey);

export async function getApplications(): Promise<Application[]> {
  const { data, error } = await supabaseAdmin.from('applications').select('*').order('applied_date', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getApplicationById(id: string): Promise<Application | null> {
  const { data, error } = await supabaseAdmin.from('applications').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

export async function createApplication(input: Omit<Application, 'id' | 'created_at' | 'updated_at'>): Promise<Application> {
  const { data, error } = await supabaseAdmin.from('applications').insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateApplication(id: string, input: Partial<Omit<Application, 'id' | 'created_at' | 'updated_at'>>): Promise<Application> {
  const { data, error } = await supabaseAdmin.from('applications').update(input).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('applications').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getStats() {
  const { data, error } = await supabaseAdmin.from('applications').select('status');
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  return {
    total: rows.length,
    applied: rows.filter(r => r.status === 'applied').length,
    confirmed: rows.filter(r => r.status === 'confirmed').length,
    rejected: rows.filter(r => r.status === 'rejected').length,
    no_response: rows.filter(r => r.status === 'no_response').length,
  };
}

export async function upsertByEmailId(input: Omit<Application, 'id' | 'created_at' | 'updated_at'>): Promise<Application> {
  const { data, error } = await supabaseAdmin.from('applications').upsert(input, { onConflict: 'email_id', ignoreDuplicates: false }).select().single();
  if (error) throw new Error(error.message);
  return data;
}
