import { Router, Request, Response } from "express";
import { embedText } from "../services/embeddings";
import { queryChunks } from "../db/pinecone";
import { generateAnswer } from "../services/llm";
import { saveChat } from "../services/database";
import { ValidationError } from "../utils/errors";
import { logger } from "../utils/logger";
import type { Source } from "../types";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { sessionId, question } = req.body;

    if (!sessionId || typeof sessionId !== "number") {
      throw new ValidationError("sessionId is required and must be a number");
    }
    if (!question || typeof question !== "string" || question.trim().length === 0) {
      throw new ValidationError("question is required and must be a non-empty string");
    }

    const trimmedQuestion = question.trim();
    logger.info("Chat request", { sessionId, question: trimmedQuestion });

    const queryEmbedding = await embedText(trimmedQuestion);
    const relevantChunks = await queryChunks(queryEmbedding, sessionId, 5);

    if (relevantChunks.length === 0) {
      const noContextAnswer =
        "No relevant documents were found for your question. Please upload a PDF first.";
      await saveChat(sessionId, trimmedQuestion, noContextAnswer, []);
      return res.json({
        success: true,
        data: { answer: noContextAnswer, sources: [] },
      });
    }

    const answer = await generateAnswer(trimmedQuestion, relevantChunks);

    const sources: Source[] = relevantChunks.map((chunk) => ({
      filename: chunk.filename,
      page: chunk.page,
      similarity_score: chunk.score,
    }));

    await saveChat(sessionId, trimmedQuestion, answer, sources);

    logger.info("Chat complete", { sessionId, sources: sources.length });

    return res.json({
      success: true,
      data: { answer, sources },
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    logger.error("Chat failed", err);
    return res.status(500).json({ success: false, error: "Failed to generate answer" });
  }
});

export default router;
