export type ApplicationStatus = 'applied' | 'confirmed' | 'rejected' | 'no_response';
export type ApplicationSource = 'gmail' | 'outlook' | 'manual';

export interface Application {
  id: string;
  company: string;
  position: string;
  applied_date: string;
  status: ApplicationStatus;
  source: ApplicationSource;
  email_id?: string | null;
  job_url?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationStats {
  total: number;
  confirmed: number;
  rejected: number;
  no_response: number;
  applied: number;
}

export interface CreateApplicationInput {
  company: string;
  position: string;
  applied_date: string;
  status?: ApplicationStatus;
  source?: ApplicationSource;
  email_id?: string;
  job_url?: string;
  notes?: string;
}

export interface UpdateApplicationInput extends Partial<CreateApplicationInput> {
  status?: ApplicationStatus;
}
