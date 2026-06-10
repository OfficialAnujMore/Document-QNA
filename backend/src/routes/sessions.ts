import { Router, Request, Response } from "express";

const router = Router();

// GET /api/sessions — list all sessions
router.get("/", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// POST /api/sessions — create a new session
router.post("/", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// GET /api/sessions/:sessionId/history — get chat history for a session
router.get("/:sessionId/history", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// GET /api/sessions/:sessionId/files — list files in a session
router.get("/:sessionId/files", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default router;
