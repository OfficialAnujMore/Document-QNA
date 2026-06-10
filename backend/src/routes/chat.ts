import { Router, Request, Response } from "express";

const router = Router();

// POST /api/chat — ask a question against uploaded documents
router.post("/", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default router;
