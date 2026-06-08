"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { checkHealth } from "@/lib/api";

export default function Home() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<string>("");

  async function testConnection() {
    setStatus("loading");
    setResult("");
    try {
      const data = await checkHealth();
      setResult(JSON.stringify(data, null, 2));
      setStatus("success");
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Document Q&A — Phase 1 Test</CardTitle>
          <p className="text-sm text-muted-foreground">
            Verifying frontend ↔ backend connection
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Backend URL:</span>
            <code className="text-xs bg-zinc-100 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}
            </code>
          </div>

          <Button onClick={testConnection} disabled={status === "loading"} className="w-full">
            {status === "loading" ? "Checking..." : "Test Backend Connection"}
          </Button>

          {status !== "idle" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={status === "success" ? "default" : status === "error" ? "destructive" : "secondary"}>
                  {status}
                </Badge>
              </div>
              {result && (
                <pre className="text-xs bg-zinc-100 p-3 rounded overflow-auto max-h-40">
                  {result}
                </pre>
              )}
            </div>
          )}

          <div className="border-t pt-4 text-xs text-muted-foreground space-y-1">
            <p>Frontend: Next.js + ShadCN/UI + Tailwind</p>
            <p>Backend: Express on :5000</p>
            <p>Phase 1 complete when button returns green ✓</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
