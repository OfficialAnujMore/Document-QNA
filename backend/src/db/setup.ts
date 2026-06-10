import { pool } from "./connection";
import { logger } from "../utils/logger";

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    chunk_count INTEGER DEFAULT 0,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT,
    sources JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_chats_session_id ON chats(session_id);
  CREATE INDEX IF NOT EXISTS idx_files_session_id ON files(session_id);
  CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at DESC);
`;

export async function setupDatabase(): Promise<void> {
  await pool.query(SCHEMA_SQL);
  logger.info("Database schema created/verified");
}
