export interface Source {
  filename: string;
  page: number;
  similarity_score: number;
}

export interface Chat {
  id: number;
  session_id: number;
  question: string;
  answer: string;
  sources: Source[];
  created_at: string;
}

export interface Session {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface UploadFile {
  id: number;
  session_id: number;
  filename: string;
  chunk_count: number;
  upload_date: string;
}

export interface APIResponse<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
