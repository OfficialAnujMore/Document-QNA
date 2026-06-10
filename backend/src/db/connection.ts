import { Pool } from "pg";
import { config } from "../config";
import { logger } from "../utils/logger";

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: { rejectUnauthorized: false },
});

export async function testConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT NOW()");
    logger.info("Database connected", { time: result.rows[0].now });
  } finally {
    client.release();
  }
}
