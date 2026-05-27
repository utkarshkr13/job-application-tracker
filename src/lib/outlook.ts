import type { ApplicationStatus } from '@/types';

const GRAPH_API = 'https://graph.microsoft.com/v1.0';
const TOKEN_URL = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID ?? 'common'}/oauth2/v2.0/token`;
const SEARCH_QUERY = '"application" OR "applied" OR "interview" OR "offer" OR "rejected" OR "thank you for applying" OR "next steps"';

async function getAccessToken(): Promise<string> {
  const res = await fetch(TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: process.env.MICROSOFT_CLIENT_ID!, client_secret: process.env.MICROSOFT_CLIENT_SECRET!, refresh_token: process.env.MICROSOFT_REFRESH_TOKEN!, grant_type: 'refresh_token', scope: 'https://graph.microsoft.com/Mail.Read' }) });
  const json = await res.json();
  if (!json.access_token) throw new Error('Failed to get Microsoft access token');
  return json.access_token;
}

function classifyStatus(subject: string, preview: string): ApplicationStatus {
  const text = `${subject} ${preview}`.toLowerCase();
  if (/interview|next steps|we.d like to|offer letter|pleased to|congratulations/i.test(text)) return 'confirmed';
  if (/not moving forward|other candidates|unfortunately|regret to inform|not selected|not a fit/i.test(text)) return 'rejected';
  if (/thank you for applying|application received|we received your|we.ve received/i.test(text)) return 'applied';
  return 'no_response';
}

function extractCompany(name: string, email: string): string {
  if (name && !/noreply|no-reply|donotreply/i.test(name)) return name.replace(/^(careers? at |jobs? at |recruiting at )/i, '').trim();
  const m = email.match(/@([^.]+)\./);
  return m ? m[1] : 'Unknown';
}

export interface ParsedOutlookJob { company: string; position: string; applied_date: string; status: ApplicationStatus; source: 'outlook'; email_id: string; }

export async function syncOutlook(maxResults = 50): Promise<ParsedOutlookJob[]> {
  const token = await getAccessToken();
  const res = await fetch(`${GRAPH_API}/me/messages?$search=${encodeURIComponent(SEARCH_QUERY)}&$top=${maxResults}&$select=id,subject,bodyPreview,from,receivedDateTime,conversationId`,
    { headers: { Authorization: `Bearer ${token}`, ConsistencyLevel: 'eventual' } });
  const { value: messages = [] } = await res.json();
  const seen = new Set<string>();
  const jobs: ParsedOutlookJob[] = [];
  for (const msg of messages) {
    if (seen.has(msg.conversationId)) continue;
    seen.add(msg.conversationId);
    jobs.push({ company: extractCompany(msg.from.emailAddress.name, msg.from.emailAddress.address),
      position: msg.subject?.replace(/re:\s*/i, '').substring(0, 80) ?? 'Unknown Role',
      applied_date: msg.receivedDateTime ? new Date(msg.receivedDateTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: classifyStatus(msg.subject, msg.bodyPreview), source: 'outlook', email_id: `outlook_${msg.conversationId}` });
  }
  return jobs;
}
