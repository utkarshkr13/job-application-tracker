// @ts-nocheck
/**
 * Gmail email sync helper.
 *
 * Uses IMAP with a Gmail App Password — no OAuth tokens, no expiry.
 *
 * One-time setup (2 min):
 * 1. Enable 2-Step Verification at myaccount.google.com/security
 * 2. Go to myaccount.google.com/apppasswords
 * 3. Click "Create App Password" → name it anything (e.g. "Job Tracker")
 * 4. Copy the 16-character password
 * 5. Set GMAIL_USER=you@gmail.com and GMAIL_APP_PASSWORD=xxxx in .env.local
 */

import type { ApplicationStatus } from '@/types';

const JOB_SUBJECT_REGEX =
  /application|applied|interview|offer|rejected|thank you for applying|we received|next steps|your candidacy|hiring|position|candidate/i;

export interface ParsedGmailJob {
  company: string;
  position: string;
  applied_date: string;
  status: ApplicationStatus;
  source: 'gmail';
  email_id: string;
}

function classifyStatus(subject: string): ApplicationStatus {
  const text = subject.toLowerCase();

  if (/interview|next steps|we.d like to|offer letter|pleased to|congratulations|move forward|excited to meet|selected/i.test(text))
    return 'confirmed';
  if (/not moving forward|other candidates|unfortunately|regret to inform|not selected|not a fit|decided to pursue|will not|won.t be/i.test(text))
    return 'rejected';
  if (/thank you for applying|application received|we received your|we.ve received|successfully submitted|received your application/i.test(text))
    return 'applied';

  return 'no_response';
}

function extractCompany(from: string): string {
  // Try sender display name first: "Acme Careers <jobs@acme.com>"
  const nameMatch = from.match(/^"?([^"<@\n]+)"?\s*</);
  if (nameMatch) {
    const name = nameMatch[1].trim();
    const cleaned = name.replace(/^(careers? at |jobs? at |recruiting at |talent at |hr at |no.?reply.*?[-–]\s*)/i, '').trim();
    if (cleaned.length > 1) return cleaned;
  }
  // Fall back to domain (acme.com → Acme)
  const domainMatch = from.match(/@([^.>\s]+)\./);
  if (domainMatch) {
    const d = domainMatch[1];
    return d.charAt(0).toUpperCase() + d.slice(1);
  }
  return 'Unknown';
}

function extractPosition(subject: string): string {
  const clean = subject.replace(/^(re:|fwd?:|fw:|re\[[\d]+\]:)\s*/gi, '').trim();

  // "Application for Software Engineer at Acme" → "Software Engineer"
  const atMatch = clean.match(
    /(?:application|applied|candidacy|position|role|opportunity)\s+(?:for\s+)?(?:the\s+)?(.{3,60}?)\s+(?:at|@|with|-|–)\s+/i
  );
  if (atMatch) return atMatch[1].trim();

  // "Software Engineer – Application Received"
  const dashMatch = clean.match(/^(.{5,60}?)\s*[-–|]\s*(?:application|interview|offer|job)/i);
  if (dashMatch) return dashMatch[1].trim();

  return clean.substring(0, 80);
}

export async function syncGmail(maxResults = 100): Promise<ParsedGmailJob[]> {
  const { ImapFlow } = await import('imapflow');

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error('GMAIL_USER or GMAIL_APP_PASSWORD not configured');

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false,
  });

  const jobs: ParsedGmailJob[] = [];

  await client.connect();
  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      // Look back 90 days
      const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const allUids = (await client.search({ since }, { uid: true })) || [];

      // Fetch only the most recent slice to stay performant
      const uidsToFetch = allUids.slice(-maxResults * 8);

      for await (const msg of client.fetch(uidsToFetch, { envelope: true, uid: true })) {
        const subject = msg.envelope?.subject ?? '';
        if (!JOB_SUBJECT_REGEX.test(subject)) continue;

        const from = msg.envelope?.from?.[0];
        if (!from) continue;

        const fromStr = `${from.name ?? ''} <${from.address ?? ''}>`;
        const date = msg.envelope?.date ?? new Date();

        jobs.push({
          email_id: `gmail_${msg.uid}`,
          company: extractCompany(fromStr),
          position: extractPosition(subject),
          applied_date: date.toISOString().split('T')[0],
          status: classifyStatus(subject),
          source: 'gmail',
        });

        if (jobs.length >= maxResults) break;
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }

  return jobs;
}
