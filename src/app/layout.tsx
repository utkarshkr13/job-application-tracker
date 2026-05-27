import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Briefcase, LayoutDashboard, List, PlusCircle } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Job Application Tracker',
  description: 'Track your job applications from Gmail and Outlook',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50`}>
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 font-semibold text-indigo-600 text-lg">
              <Briefcase className="w-5 h-5" />
              JobTracker
            </Link>
            <nav className="flex items-center gap-1">
              <NavLink href="/" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
              <NavLink href="/applications" icon={<List className="w-4 h-4" />} label="Applications" />
              <Link href="/add" className="flex items-center gap-1.5 ml-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
                <PlusCircle className="w-4 h-4" />
                Add Job
              </Link>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 text-sm font-medium transition-colors">
      {icon}
      {label}
    </Link>
  );
}
