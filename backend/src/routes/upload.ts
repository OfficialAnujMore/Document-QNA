import { Router, Request, Response } from "express";

const router = Router();

// POST /api/upload — upload a PDF file to a session
router.post("/", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default router;
