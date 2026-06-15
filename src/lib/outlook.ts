// @ts-nocheck
/**
 * Outlook email sync helper.
 *
 * Uses IMAP with a Microsoft App Password — no OAuth tokens, no expiry.
 *
 * One-time setup (2 min):
 * 1. Enable 2-Step Verification at account.microsoft.com/security
 * 2. Go to Advanced security options → App passwords → Create new
 * 3. Name it "Job Tracker" and copy the generated password
 * 4. Set OUTLOOK_USER=you@outlook.com and OUTLOOK_APP_PASSWORD=xxxx in .env.local
 *
 * Note: Works with @outlook.com, @hotmail.com, and @live.com addresses.
 *       For Microsoft 365 / work accounts, ask your IT admin to enable IMAP.
 */

import type { ApplicationStatus } from '@/types';

const JOB_SUBJECT_REGEX =
  /application|applied|interview|offer|rejected|thank you for applying|we received|next steps|your candidacy|hiring|position|candidate/i;

export interface ParsedOutlookJob {
  company: string;
  position: string;
  applied_date: string;
  status: ApplicationStatus;
  source: 'outlook';
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
  const nameMatch = from.match(/^"?([^"<@\n]+)"?\s*</);
  if (nameMatch) {
    const name = nameMatch[1].trim();
    const cleaned = name.replace(/^(careers? at |jobs? at |recruiting at |talent at |hr at |no.?reply.*?[-–]\s*)/i, '').trim();
    if (cleaned.length > 1) return cleaned;
  }
  const domainMatch = from.match(/@([^.>\s]+)\./);
  if (domainMatch) {
    const d = domainMatch[1];
    return d.charAt(0).toUpperCase() + d.slice(1);
  }
  return 'Unknown';
}

function extractPosition(subject: string): string {
  const clean = subject.replace(/^(re:|fwd?:|fw:|re\[[\d]+\]:)\s*/gi, '').trim();

  const atMatch = clean.match(
    /(?:application|applied|candidacy|position|role|opportunity)\s+(?:for\s+)?(?:the\s+)?(.{3,60}?)\s+(?:at|@|with|-|–)\s+/i
  );
  if (atMatch) return atMatch[1].trim();

  const dashMatch = clean.match(/^(.{5,60}?)\s*[-–|]\s*(?:application|interview|offer|job)/i);
  if (dashMatch) return dashMatch[1].trim();

  return clean.substring(0, 80);
}

export async function syncOutlook(maxResults = 100): Promise<ParsedOutlookJob[]> {
  const { ImapFlow } = await import('imapflow');

  const user = process.env.OUTLOOK_USER;
  const pass = process.env.OUTLOOK_APP_PASSWORD;
  if (!user || !pass) throw new Error('OUTLOOK_USER or OUTLOOK_APP_PASSWORD not configured');

  const client = new ImapFlow({
    host: 'outlook.office365.com',
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false,
  });

  const jobs: ParsedOutlookJob[] = [];
  const seen = new Set<string>(); // deduplicate by subject+sender

  await client.connect();
  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const allUids = (await client.search({ since }, { uid: true })) || [];
      const uidsToFetch = allUids.slice(-maxResults * 8);

      for await (const msg of client.fetch(uidsToFetch, { envelope: true, uid: true })) {
        const subject = msg.envelope?.subject ?? '';
        if (!JOB_SUBJECT_REGEX.test(subject)) continue;

        const from = msg.envelope?.from?.[0];
        if (!from) continue;

        const fromStr = `${from.name ?? ''} <${from.address ?? ''}>`;
        const date = msg.envelope?.date ?? new Date();

        // Deduplicate by sender+subject (Outlook sometimes duplicates)
        const key = `${fromStr}__${subject}`;
        if (seen.has(key)) continue;
        seen.add(key);

        jobs.push({
          email_id: `outlook_${msg.uid}`,
          company: extractCompany(fromStr),
          position: extractPosition(subject),
          applied_date: date.toISOString().split('T')[0],
          status: classifyStatus(subject),
          source: 'outlook',
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
