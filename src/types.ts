export type OccurrencePriority = 'ALTA' | 'MÉDIA' | 'BAIXA';
export type OccurrenceStatus = 'PENDENTE' | 'VIATURA_A_CAMINHO' | 'EM_ATENDIMENTO' | 'FINALIZADA' | 'CANCELADA';

export interface Occurrence {
  id: number;
  protocol: string;
  telegram_user_id: number;
  telegram_username: string | null;
  citizen_name: string | null;
  citizen_phone: string | null;
  category: string;
  description: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  photo_urls: string[];
  video_urls: string[];
  ai_priority: OccurrencePriority;
  ai_summary: string | null;
  ai_recommended_unit: string | null;
  ai_risk_score: number | null;
  status: OccurrenceStatus;
  dispatched_unit: string | null;
  dispatcher_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AITriageResponse {
  priority: OccurrencePriority;
  category: string;
  recommended_unit: string;
  risk_score: number;
  summary: string;
  immediate_action: string;
}

export interface PythonFile {
  path: string;
  folder: string;
  filename: string;
  language: string;
  content: string;
  description: string;
}
