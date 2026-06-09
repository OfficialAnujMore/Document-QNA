"use client";

import { useState } from "react";
import { toast } from "sonner";
import FileUpload, { type UploadedFile } from "@/components/FileUpload";
import ChatArea, { type Message, type Source } from "@/components/ChatArea";
import SessionList, { type Session } from "@/components/SessionList";
import { Separator } from "@/components/ui/separator";

// ─── Mock data for Phase 2 UI demo ───────────────────────────────────────────

const MOCK_FILES: UploadedFile[] = [
  { id: "f1", name: "annual-report-2024.pdf", size: 2_400_000, uploadedAt: new Date() },
  { id: "f2", name: "product-spec.pdf", size: 512_000, uploadedAt: new Date() },
];

const MOCK_SESSIONS: Session[] = [
  { id: "s1", preview: "What is the revenue for Q3?", createdAt: new Date(Date.now() - 1000 * 60 * 30) },
  { id: "s2", preview: "Summarise the product roadmap", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) },
];

const MOCK_SOURCES: Source[] = [
  { filename: "annual-report-2024.pdf", chunkIndex: 3, score: 0.92 },
  { filename: "annual-report-2024.pdf", chunkIndex: 7, score: 0.87 },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: "m1",
    role: "user",
    content: "What is the total revenue for 2024?",
    createdAt: new Date(Date.now() - 60_000),
  },
  {
    id: "m2",
    role: "assistant",
    content:
      "According to the annual report, the total revenue for 2024 was $4.2 billion, representing a 12% year-over-year growth. The strongest performing segment was cloud services, which grew 34% to $1.8 billion.",
    sources: MOCK_SOURCES,
    createdAt: new Date(Date.now() - 55_000),
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [files, setFiles] = useState<UploadedFile[]>(MOCK_FILES);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string | null>("s1");
  const [isUploading, setIsUploading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Stub: simulate upload
  function handleUpload(file: File) {
    setIsUploading(true);
    setTimeout(() => {
      const newFile: UploadedFile = {
        id: `f${Date.now()}`,
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
      };
      setFiles((prev) => [...prev, newFile]);
      setIsUploading(false);
      toast.success(`"${file.name}" uploaded successfully`);
    }, 1500);
  }

  // Stub: simulate delete
  function handleDelete(fileId: string) {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    toast.info("File removed");
  }

  // Stub: simulate chat response
  function handleSend(question: string) {
    const userMsg: Message = {
      id: `m${Date.now()}`,
      role: "user",
      content: question,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    setTimeout(() => {
      const assistantMsg: Message = {
        id: `m${Date.now() + 1}`,
        role: "assistant",
        content:
          "This is a mock response for Phase 2. In Phase 6 this will be a real answer retrieved from your documents using vector search and GPT.",
        sources: MOCK_SOURCES,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsChatLoading(false);
    }, 2000);
  }

  // Stub: select session
  function handleSelectSession(sessionId: string) {
    setActiveSessionId(sessionId);
    setMessages(MOCK_MESSAGES);
    toast.info("Session loaded (mock)");
  }

  // Stub: new chat
  function handleNewChat() {
    setActiveSessionId(null);
    setMessages([]);
    const newSession: Session = {
      id: `s${Date.now()}`,
      preview: "New conversation",
      createdAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-zinc-200 bg-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-zinc-900 flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-semibold text-zinc-900 text-sm">Document Q&A</span>
        </div>
        <span className="text-xs text-zinc-400">Phase 2 — UI preview</span>
      </header>

      {/* Main two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r border-zinc-200 bg-zinc-50 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-6">
            <FileUpload
              files={files}
              isUploading={isUploading}
              onUpload={handleUpload}
              onDelete={handleDelete}
            />
            <Separator />
            <SessionList
              sessions={sessions}
              activeSessionId={activeSessionId}
              isLoading={false}
              onSelect={handleSelectSession}
              onNewChat={handleNewChat}
            />
          </div>
        </aside>

        {/* Chat main area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-zinc-50">
          <ChatArea
            messages={messages}
            isLoading={isChatLoading}
            hasFiles={files.length > 0}
            onSend={handleSend}
          />
        </main>
      </div>
    </div>
  );
}
