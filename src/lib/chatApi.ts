import type { Message } from "../types/chat";

interface ChatApiResponse {
  content?: string;
  error?: string;
  finishReason?: string;
}

export interface ChatResult {
  content: string;
  truncated: boolean;
}

export async function getChatbotResponse(
  history: Message[],
): Promise<ChatResult> {
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
    if (import.meta.env.DEV) {
      return { content: await mockResponse(history), truncated: false };
    }
    throw err;
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    if (import.meta.env.DEV) {
      return { content: await mockResponse(history), truncated: false };
    }
    throw new Error("Unexpected response from server");
  }

  const data = (await res.json()) as ChatApiResponse;

  if (res.status === 503 || data.error === "not_configured") {
    return { content: await mockResponse(history), truncated: false };
  }
  if (!res.ok) throw new Error(data.error ?? `API error: ${res.status}`);

  const content = data.content?.trim();
  if (!content) throw new Error("Empty response from server");
  return { content, truncated: data.finishReason === "length" };
}

function mockResponse(history: Message[]): Promise<string> {
  const last = history[history.length - 1]?.content ?? "";
  const replies = [
    `You asked: "${last}". (Mock reply — no API key configured.)`,
    `Here is my take on "${last}". (Mock reply.)`,
  ];
  const text = replies[Math.floor(Math.random() * replies.length)];
  return new Promise((resolve) => setTimeout(() => resolve(text), 400));
}
