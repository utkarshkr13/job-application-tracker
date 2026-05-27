import { ApplicationForm } from '@/components/ApplicationForm';
import { getApplicationById } from '@/lib/supabase';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface Props { searchParams: { id?: string } }

export default async function AddPage({ searchParams }: Props) {
  const existing = searchParams.id ? await getApplicationById(searchParams.id) : null;
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/applications" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" />
          Back to Applications
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">{existing ? 'Edit Application' : 'Add Application'}</h1>
        <p className="text-slate-500 text-sm mt-1">{existing ? `Editing entry for ${existing.company}` : 'Manually add a job application to your tracker'}</p>
      </div>
      <ApplicationForm existing={existing ?? undefined} />
    </div>
  );
}
