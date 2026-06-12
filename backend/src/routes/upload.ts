import { Router, Request, Response } from "express";
import multer from "multer";
import { processPDF } from "../services/pdf";
import { embedBatch } from "../services/embeddings";
import { addChunks } from "../db/pinecone";
import { addFile } from "../services/database";
import { ValidationError } from "../utils/errors";
import { logger } from "../utils/logger";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new ValidationError("Only PDF files are accepted"));
    }
  },
});

router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new ValidationError("No file uploaded");
    }

    const sessionId = parseInt(req.body.sessionId, 10);
    if (isNaN(sessionId)) {
      throw new ValidationError("sessionId is required and must be a number");
    }

    const { originalname, buffer } = req.file;
    logger.info("Upload started", { filename: originalname, sessionId, sizeBytes: buffer.length });

    const { chunks, pageNumbers, totalPages, totalChunks } = await processPDF(buffer, originalname);

    if (chunks.length === 0) {
      throw new ValidationError("No text could be extracted from the PDF");
    }

    const embeddings = await embedBatch(chunks);

    await addChunks(chunks, embeddings, sessionId, originalname, pageNumbers);

    await addFile(sessionId, originalname, totalChunks);

    logger.info("Upload complete", { filename: originalname, sessionId, totalPages, totalChunks });

    res.json({
      success: true,
      data: {
        filename: originalname,
        totalPages,
        totalChunks,
      },
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(err.statusCode).json({ success: false, error: err.message });
    } else {
      logger.error("Upload failed", err);
      res.status(500).json({ success: false, error: "Failed to process PDF" });
    }
  }
});

export default router;
