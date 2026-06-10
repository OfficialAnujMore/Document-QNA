import { pool } from "../db/connection";
import type { Session, UploadFile, Chat, Source } from "../types";

// --- Sessions ---

export async function createSession(): Promise<number> {
  const result = await pool.query<{ id: number }>(
    "INSERT INTO sessions DEFAULT VALUES RETURNING id"
  );
  return result.rows[0].id;
}

export async function getAllSessions(): Promise<Session[]> {
  const result = await pool.query<Session>(
    "SELECT id, created_at, updated_at FROM sessions ORDER BY updated_at DESC"
  );
  return result.rows;
}

// --- Files ---

export async function addFile(
  sessionId: number,
  filename: string,
  chunkCount: number
): Promise<void> {
  await pool.query(
    "INSERT INTO files (session_id, filename, chunk_count) VALUES ($1, $2, $3)",
    [sessionId, filename, chunkCount]
  );
}

export async function getFilesBySession(sessionId: number): Promise<UploadFile[]> {
  const result = await pool.query<UploadFile>(
    "SELECT id, session_id, filename, chunk_count, upload_date FROM files WHERE session_id = $1 ORDER BY upload_date DESC",
    [sessionId]
  );
  return result.rows;
}

// --- Chats ---

export async function saveChat(
  sessionId: number,
  question: string,
  answer: string,
  sources: Source[]
): Promise<void> {
  await pool.query(
    "INSERT INTO chats (session_id, question, answer, sources) VALUES ($1, $2, $3, $4)",
    [sessionId, question, answer, JSON.stringify(sources)]
  );
}

export async function getChatHistory(sessionId: number): Promise<Chat[]> {
  const result = await pool.query<Chat>(
    "SELECT id, session_id, question, answer, sources, created_at FROM chats WHERE session_id = $1 ORDER BY created_at ASC",
    [sessionId]
  );
  return result.rows;
}
