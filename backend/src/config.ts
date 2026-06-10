import dotenv from "dotenv";

dotenv.config();

const REQUIRED_VARS = ["OPENAI_API_KEY", "DATABASE_URL"];

function validateConfig() {
  const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

validateConfig();

export const config = {
  port: parseInt(process.env.PORT || "5001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  openaiApiKey: process.env.OPENAI_API_KEY as string,
  databaseUrl: process.env.DATABASE_URL as string,
  chromaPath: process.env.CHROMA_PATH || "./chroma_db",
  debug: process.env.DEBUG === "true",
};
