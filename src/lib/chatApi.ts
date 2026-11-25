import type { Message } from "../types/chat";

interface ChatApiResponse {
  content?: string;
  error?: string;
  finishReason?: string;
}

export interface StreamResult {
  content: string;
  truncated: boolean;
  tokens?: number;
}

export interface StreamOptions {
  signal?: AbortSignal;
  onDelta?: (delta: string) => void;
}

interface StreamFrame {
  delta?: string;
  done?: boolean;
  finishReason?: string;
  tokens?: number;
  error?: string;
}

function toWire(history: Message[]) {
  return history
    .filter((m) => !m.error && !m.streaming && m.content.trim().length > 0)
    .map((m) => ({ role: m.role, content: m.content }));
}

export async function streamChatbotResponse(
  history: Message[],
  options: StreamOptions = {},
): Promise<StreamResult> {
  const { signal, onDelta } = options;
  const messages = toWire(history);

  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    if (import.meta.env.DEV) return mockStream(history, options);
    throw err;
  }

  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = (await res.json().catch(() => ({}))) as ChatApiResponse;
    if (res.status === 503 || data.error === "not_configured") {
      return mockStream(history, options);
    }
    throw new Error(data.error ?? `API error: ${res.status}`);
  }

  if (!res.body) throw new Error("No response stream");
  if (!contentType.includes("text/event-stream")) {
    if (import.meta.env.DEV) return mockStream(history, options);
    throw new Error("Unexpected response from server");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  let finishReason = "stop";
  let tokens: number | undefined;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const line = frame.trim();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;

      let json: StreamFrame;
      try {
        json = JSON.parse(payload) as StreamFrame;
      } catch {
        continue;
      }

      if (json.error) throw new Error(json.error);
      if (json.delta) {
        content += json.delta;
        onDelta?.(json.delta);
      }
      if (json.finishReason) finishReason = json.finishReason;
      if (typeof json.tokens === "number") tokens = json.tokens;
    }
  }

  if (!content.trim()) throw new Error("Empty response from server");
  return {
    content: content.trim(),
    truncated: finishReason === "length",
    tokens,
  };
}

async function mockStream(
  history: Message[],
  options: StreamOptions,
): Promise<StreamResult> {
  const text = mockText(history);
  for (const char of text) {
    if (options.signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    options.onDelta?.(char);
    await new Promise((resolve) => setTimeout(resolve, 12));
  }
  return { content: text, truncated: false };
}

function mockText(history: Message[]): string {
  const last = history[history.length - 1]?.content ?? "";
  const replies = [
    `You asked: "${last}". (Mock reply — no API key configured.)`,
    `Here is my take on "${last}". (Mock reply.)`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}
