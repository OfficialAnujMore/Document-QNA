const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}

export async function checkHealth(): Promise<{ status: string; timestamp: string; message: string }> {
  return fetchAPI("/api/health");
}

export { fetchAPI };
