import pdfParse = require("pdf-parse");
import { logger } from "../utils/logger";

export interface PDFChunk {
  text: string;
  page: number;
  chunkIndex: number;
}

export interface PDFProcessResult {
  chunks: string[];
  pageNumbers: number[];
  totalPages: number;
  totalChunks: number;
}

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

export async function extractTextFromPDF(
  buffer: Buffer
): Promise<Array<{ text: string; page: number }>> {
  const data = await pdfParse(buffer);

  const pageTexts: Array<{ text: string; page: number }> = [];

  await pdfParse(buffer, {
    pagerender: (pageData: any) => {
      return pageData.getTextContent().then((content: { items: Array<{ str: string }> }) => {
        const pageText = content.items.map((item) => item.str).join(" ").trim();
        if (pageText.length > 0) {
          pageTexts.push({ text: pageText, page: pageData.pageIndex + 1 });
        }
        return pageText;
      });
    },
  });

  if (pageTexts.length === 0 && data.text.trim().length > 0) {
    pageTexts.push({ text: data.text.trim(), page: 1 });
  }

  logger.info("PDF text extracted", {
    pages: data.numpages,
    extractedPages: pageTexts.length,
    totalChars: data.text.length,
  });

  return pageTexts;
}

export function chunkText(
  text: string,
  chunkSize: number = CHUNK_SIZE,
  overlap: number = CHUNK_OVERLAP
): string[] {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    const chunk = words.slice(start, end).join(" ").trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    if (end === words.length) break;
    start += chunkSize - overlap;
  }

  return chunks;
}

export async function processPDF(
  buffer: Buffer,
  filename: string
): Promise<PDFProcessResult> {
  const pageTexts = await extractTextFromPDF(buffer);

  const allChunks: string[] = [];
  const allPageNumbers: number[] = [];

  for (const { text, page } of pageTexts) {
    const pageChunks = chunkText(text);
    for (const chunk of pageChunks) {
      allChunks.push(chunk);
      allPageNumbers.push(page);
    }
  }

  logger.info("PDF processed", {
    filename,
    totalPages: pageTexts.length,
    totalChunks: allChunks.length,
  });

  return {
    chunks: allChunks,
    pageNumbers: allPageNumbers,
    totalPages: pageTexts.length,
    totalChunks: allChunks.length,
  };
}
