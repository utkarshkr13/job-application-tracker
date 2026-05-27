import type { ApplicationStatus } from '@/types';

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SEARCH_QUERY = 'subject:(application OR applied OR "job application" OR interview OR offer OR rejected OR "thank you for applying" OR "we received your" OR "next steps")';

async function getAccessToken(): Promise<string> {
  const res = await fetch(TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, refresh_token: process.env.GOOGLE_REFRESH_TOKEN!, grant_type: 'refresh_token' }) });
  const json = await res.json();
  if (!json.access_token) throw new Error('Failed to get Google access token');
  return json.access_token;
}

function classifyStatus(subject: string, snippet: string): ApplicationStatus {
  const text = `${subject} ${snippet}`.toLowerCase();
  if (/interview|next steps|we.d like to|offer letter|pleased to|congratulations/i.test(text)) return 'confirmed';
  if (/not moving forward|other candidates|unfortunately|regret to inform|not selected|not a fit/i.test(text)) return 'rejected';
  if (/thank you for applying|application received|we received your|we.ve received/i.test(text)) return 'applied';
  return 'no_response';
}

function extractCompany(from: string): string {
  const nameMatch = from.match(/^"?([^"<]+)"?\s*</);
  if (nameMatch) return nameMatch[1].trim().replace(/^(careers? at |jobs? at |recruiting at )/i, '').trim();
  const domainMatch = from.match(/@([^.>]+)\./);
  return domainMatch ? domainMatch[1] : 'Unknown';
}

export interface ParsedGmailJob { company: string; position: string; applied_date: string; status: ApplicationStatus; source: 'gmail'; email_id: string; }

export async function syncGmail(maxResults = 50): Promise<ParsedGmailJob[]> {
  const token = await getAccessToken();
  const listRes = await fetch(`${GMAIL_API}/users/me/threads?q=${encodeURIComponent(SEARCH_QUERY)}&maxResults=${maxResults}`, { headers: { Authorization: `Bearer ${token}` } });
  const { threads = [] } = await listRes.json();
  const jobs: ParsedGmailJob[] = [];
  for (const thread of threads) {
    try {
      const threadRes = await fetch(`${GMAIL_API}/users/me/threads/${thread.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, { headers: { Authorization: `Bearer ${token}` } });
      const threadJson = await threadRes.json();
      const firstMsg = threadJson.messages?.[0];
      if (!firstMsg) continue;
      const headers = firstMsg.payload.headers;
      const subject = headers.find((h: {name:string;value:string}) => h.name === 'Subject')?.value ?? '';
      const from = headers.find((h: {name:string;value:string}) => h.name === 'From')?.value ?? '';
      const date = headers.find((h: {name:string;value:string}) => h.name === 'Date')?.value ?? '';
      const parsed = new Date(date);
      jobs.push({ company: extractCompany(from), position: subject.replace(/re:\s*/i, '').substring(0, 80),
        applied_date: isNaN(parsed.getTime()) ? new Date().toISOString().split('T')[0] : parsed.toISOString().split('T')[0],
        status: classifyStatus(subject, thread.snippet), source: 'gmail', email_id: `gmail_${thread.id}` });
    } catch { /* skip malformed */ }
  }
  return jobs;
}
