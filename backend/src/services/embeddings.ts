import OpenAI from "openai";
import { config } from "../config";
import { logger } from "../utils/logger";

const openai = new OpenAI({ apiKey: config.openaiApiKey });

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;
const BATCH_SIZE = 100;

export { EMBEDDING_DIMENSIONS };

export async function embedText(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });

    const batchEmbeddings = response.data
      .sort((a, b) => a.index - b.index)
      .map((item) => item.embedding);

    allEmbeddings.push(...batchEmbeddings);

    logger.info("Embeddings batch complete", {
      batch: Math.floor(i / BATCH_SIZE) + 1,
      totalBatches: Math.ceil(texts.length / BATCH_SIZE),
      count: batch.length,
    });
  }

  return allEmbeddings;
}
