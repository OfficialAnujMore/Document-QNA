"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export interface Source {
  filename: string;
  chunkIndex: number;
  score: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  createdAt: Date;
}

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  hasFiles: boolean;
  onSend: (question: string) => void;
}

function UserBubble({ message }: { message: Message }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-zinc-900 px-4 py-2.5 text-sm text-white">
        {message.content}
      </div>
    </div>
  );
}

function AssistantBubble({ message }: { message: Message }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>

      {message.sources && message.sources.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-1">
          <span className="text-xs text-zinc-400 self-center">Sources:</span>
          {message.sources.map((src, i) => (
            <Badge key={i} variant="secondary" className="text-xs gap-1">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {src.filename}
              <span className="text-zinc-400">· {Math.round(src.score * 100)}%</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-tl-sm bg-white border border-zinc-200 px-4 py-3">
        <div className="flex gap-1 items-center">
          <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

export default function ChatArea({ messages, isLoading, hasFiles, onSend }: ChatAreaProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const canSend = input.trim().length > 0 && !isLoading && hasFiles;

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-zinc-400">
            <svg className="h-12 w-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {hasFiles ? (
              <>
                <p className="text-sm font-medium">Ask a question</p>
                <p className="text-xs mt-1">Your documents are ready — ask anything about them</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">No documents uploaded</p>
                <p className="text-xs mt-1">Upload a PDF from the sidebar to get started</p>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            {messages.map((msg) =>
              msg.role === "user" ? (
                <UserBubble key={msg.id} message={msg} />
              ) : (
                <AssistantBubble key={msg.id} message={msg} />
              )
            )}
            {isLoading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-zinc-200 bg-white px-4 py-3">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasFiles ? "Ask a question about your documents…" : "Upload a PDF first…"}
            disabled={!hasFiles || isLoading}
            rows={1}
            className="resize-none min-h-[40px] max-h-[120px] overflow-auto"
          />
          <Button onClick={handleSend} disabled={!canSend} className="self-end shrink-0">
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
            <span className="ml-1.5">{isLoading ? "Thinking…" : "Send"}</span>
          </Button>
        </div>
        <p className="text-xs text-zinc-400 text-center mt-2">
          Press <kbd className="bg-zinc-100 px-1 rounded">Enter</kbd> to send · <kbd className="bg-zinc-100 px-1 rounded">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
