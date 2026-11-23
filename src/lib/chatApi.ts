import type { Message } from "../types/chat";

interface ChatApiResponse {
  content?: string;
  error?: string;
}

export async function getChatbotResponse(history: Message[]): Promise<string> {
  const messages = history
    .filter((m) => !m.error)
    .map((m) => ({ role: m.role, content: m.content }));

  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
  } catch (err) {
    if (import.meta.env.DEV) return mockResponse(history);
    throw err;
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    // Plain `vite dev` has no /api route and serves index.html here.
    if (import.meta.env.DEV) return mockResponse(history);
    throw new Error("Unexpected response from server");
  }

  const data = (await res.json()) as ChatApiResponse;

  // Server has no GROQ_API_KEY set — keep the app usable with mock replies.
  if (res.status === 503 || data.error === "not_configured") {
    return mockResponse(history);
  }

  if (!res.ok) {
    throw new Error(data.error ?? `API error: ${res.status}`);
  }

  const content = data.content?.trim();
  if (!content) throw new Error("Empty response from server");
  return content;
}

function mockResponse(history: Message[]): Promise<string> {
  const last = history[history.length - 1]?.content ?? "";
  const replies = [
    `You asked: "${last}". Great question!`,
    `Here is my take on "${last}".`,
    `Interesting — tell me more about "${last}".`,
  ];
  const text = replies[Math.floor(Math.random() * replies.length)];
  return new Promise((resolve) => setTimeout(() => resolve(text), 600));
}
