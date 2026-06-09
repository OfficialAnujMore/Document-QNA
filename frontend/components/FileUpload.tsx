"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
}

interface FileUploadProps {
  files: UploadedFile[];
  isUploading: boolean;
  onUpload: (file: File) => void;
  onDelete: (fileId: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({ files, isUploading, onUpload, onDelete }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide mb-3">
          Documents
        </h2>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <Button
          className="w-full"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Uploading…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload PDF
            </span>
          )}
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        {isUploading && (
          <div className="flex flex-col gap-2 p-3 rounded-lg border border-zinc-200 bg-white">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        )}

        {files.length === 0 && !isUploading ? (
          <div className="text-center py-8 text-zinc-400">
            <svg className="h-8 w-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">No documents yet</p>
            <p className="text-xs mt-1">Upload a PDF to get started</p>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="flex items-start justify-between gap-2 p-3 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-start gap-2 min-w-0">
                <svg className="h-4 w-4 mt-0.5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-800 truncate">{file.name}</p>
                  <p className="text-xs text-zinc-400">{formatBytes(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Badge variant="secondary" className="text-xs">PDF</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-zinc-400 hover:text-red-500"
                  onClick={() => onDelete(file.id)}
                  title="Remove file"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
