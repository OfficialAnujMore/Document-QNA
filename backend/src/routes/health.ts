import { Router, Request, Response } from "express";
import { logger } from "../utils/logger";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  logger.info("Health check hit");
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    message: "Document Q&A backend is running",
  });
});

router.get("/ping", (_req: Request, res: Response) => {
  logger.info("Ping hit");
  res.json({ pong: true });
});

export default router;
