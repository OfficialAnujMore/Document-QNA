"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export interface Session {
  id: string;
  preview: string;
  createdAt: Date;
}

interface SessionListProps {
  sessions: Session[];
  activeSessionId: string | null;
  isLoading: boolean;
  onSelect: (sessionId: string) => void;
  onNewChat: () => void;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function SessionList({
  sessions,
  activeSessionId,
  isLoading,
  onSelect,
  onNewChat,
}: SessionListProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">
          History
        </h2>
        <Button variant="ghost" size="sm" onClick={onNewChat} className="h-7 text-xs px-2">
          + New chat
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col gap-1">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-2.5 rounded-lg space-y-1.5">
              <Skeleton className="h-3.5 w-4/5" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))
        ) : sessions.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-4">No past chats yet</p>
        ) : (
          sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelect(session.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                session.id === activeSessionId
                  ? "bg-zinc-900 text-white"
                  : "hover:bg-zinc-100 text-zinc-700"
              }`}
            >
              <p className="text-sm font-medium truncate leading-snug">{session.preview}</p>
              <p className={`text-xs mt-0.5 ${session.id === activeSessionId ? "text-zinc-400" : "text-zinc-400"}`}>
                {timeAgo(session.createdAt)}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
