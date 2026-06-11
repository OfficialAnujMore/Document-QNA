import { Pinecone } from "@pinecone-database/pinecone";
import type { Index } from "@pinecone-database/pinecone";
import { config } from "../config";
import { logger } from "../utils/logger";

const pc = new Pinecone({ apiKey: config.pineconeApiKey });

let index: Index;

export async function initPinecone(): Promise<void> {
  index = pc.index(config.pineconeIndex);
  const stats = await index.describeIndexStats();
  logger.info("Pinecone initialized", {
    index: config.pineconeIndex,
    totalVectors: stats.totalRecordCount ?? 0,
  });
}

export function getIndex(): Index {
  if (!index) throw new Error("Pinecone not initialized — call initPinecone() first");
  return index;
}

// Stores text chunks + embedding vectors for a file in a session.
// Text is stored in metadata because Pinecone doesn't return raw vectors on query.
export async function addChunks(
  chunks: string[],
  embeddings: number[][],
  sessionId: number,
  filename: string,
  pageNumbers: number[]
): Promise<void> {
  const idx = getIndex();
  const vectors = chunks.map((text, i) => ({
    id: `session_${sessionId}_${filename}_chunk_${i}`,
    values: embeddings[i],
    metadata: {
      session_id: sessionId,
      filename,
      page: pageNumbers[i] ?? 1,
      chunk_index: i,
      text, // stored here so we can retrieve it on query
    },
  }));

  // Pinecone recommends batches of 100 max
  const BATCH_SIZE = 100;
  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    await idx.upsert({ records: vectors.slice(i, i + BATCH_SIZE) });
  }

  logger.info("Stored chunks in Pinecone", { sessionId, filename, count: chunks.length });
}

// Finds the topK most similar chunks to a query embedding, within a specific session.
export async function queryChunks(
  queryEmbedding: number[],
  sessionId: number,
  topK: number = 5
): Promise<Array<{ text: string; filename: string; page: number; score: number }>> {
  const idx = getIndex();
  const results = await idx.query({
    vector: queryEmbedding,
    topK,
    filter: { session_id: sessionId },
    includeMetadata: true,
  });

  return (results.matches ?? []).map((match) => ({
    text: String(match.metadata?.text ?? ""),
    filename: String(match.metadata?.filename ?? ""),
    page: Number(match.metadata?.page ?? 1),
    score: parseFloat((match.score ?? 0).toFixed(4)),
  }));
}

// Removes all stored chunks for a session — called when a session is deleted.
export async function deleteSessionChunks(sessionId: number): Promise<void> {
  const idx = getIndex();
  await idx.deleteMany({ filter: { session_id: sessionId } });
  logger.info("Deleted Pinecone chunks for session", { sessionId });
}
