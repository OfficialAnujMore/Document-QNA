import OpenAI from "openai";
import { config } from "../config";
import { logger } from "../utils/logger";

const openai = new OpenAI({ apiKey: config.openaiApiKey });

const CHAT_MODEL = "gpt-3.5-turbo";

export interface RetrievedChunk {
  text: string;
  filename: string;
  page: number;
  score: number;
}

export async function generateAnswer(
  question: string,
  context: RetrievedChunk[]
): Promise<string> {
  const contextText = context
    .map((c, i) => `[${i + 1}] (${c.filename}, page ${c.page}):\n${c.text}`)
    .join("\n\n");

  const systemPrompt = `You are a helpful assistant that answers questions based strictly on the provided document excerpts.
If the answer cannot be found in the excerpts, say so clearly — do not make up information.
Always cite which excerpt(s) you used by referencing the source filename and page number.`;

  const userPrompt = `Document excerpts:\n\n${contextText}\n\nQuestion: ${question}`;

  logger.info("Generating answer", { model: CHAT_MODEL, contextChunks: context.length });

  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
  });

  return response.choices[0].message.content ?? "No answer generated.";
}
