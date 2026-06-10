import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config";
import { logger } from "./utils/logger";
import { AppError } from "./utils/errors";
import { testConnection } from "./db/connection";
import { setupDatabase } from "./db/setup";
import { initPinecone } from "./db/pinecone";
import healthRouter from "./routes/health";
import uploadRouter from "./routes/upload";
import chatRouter from "./routes/chat";
import sessionsRouter from "./routes/sessions";

const app = express();

app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api", healthRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/chat", chatRouter);
app.use("/api/sessions", sessionsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error("Unhandled error", err);
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  res.status(statusCode).json({ error: err.message || "Internal server error" });
});

async function start() {
  try {
    await testConnection();
    await setupDatabase();
    await initPinecone();
  } catch (err) {
    logger.error("Startup failed", err);
    process.exit(1);
  }

  app.listen(config.port, () => {
    logger.info(`Backend server running on http://localhost:${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
  });
}

start();

export default app;
