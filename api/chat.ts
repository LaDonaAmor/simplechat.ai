interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ApiRequest {
  method?: string;
  body: unknown;
  on?: (event: "close", listener: () => void) => void;
}

interface ApiJsonResponse {
  json: (body: Record<string, unknown>) => void;
}

interface ApiResponse {
  status: (code: number) => ApiJsonResponse;
  setHeader: (name: string, value: string) => void;
  write: (chunk: string) => unknown;
  end: () => void;
}

const SYSTEM_PROMPT = [
  "You are a concise, helpful assistant.",
  "Answer the user's actual question. Do not invent their project, goals, audience, budget, deadline, or requirements.",
  "If essential information is missing, ask one brief clarifying question.",
  "Use clear, plain language and keep answers concise unless the user asks for detail.",
  "Use Markdown only when it improves readability. Use tables only when comparing structured information.",
  "Never include HTML tags such as <br>.",
].join(" ");

const MODEL = "openai/gpt-oss-20b";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_COMPLETION_TOKENS = 2048;
const MAX_MESSAGES = 40;
const MAX_TOTAL_CHARS = 8000;
const UPSTREAM_TIMEOUT_MS = 25_000;

function safeParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function parseHistory(body: unknown): ChatMessage[] {
  const raw =
    typeof body === "string"
      ? safeParse(body)
      : (body as { messages?: unknown } | null | undefined)?.messages;

  if (!Array.isArray(raw)) return [];

  const messages: ChatMessage[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if (
      (role === "user" || role === "assistant") &&
      typeof content === "string"
    ) {
      messages.push({ role, content });
    }
  }
  return messages;
}

interface GroqChunk {
  choices?: {
    delta?: { content?: string };
    finish_reason?: string | null;
  }[];
  usage?: { completion_tokens?: number };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "not_configured" });
    return;
  }

  const messages = parseHistory(req.body).slice(-MAX_MESSAGES);
  if (messages.length === 0) {
    res.status(400).json({ error: "No messages provided" });
    return;
  }

  const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
  if (totalChars > MAX_TOTAL_CHARS) {
    res.status(413).json({ error: "Conversation too long" });
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  req.on?.("close", () => controller.abort());

  try {
    const upstream = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_completion_tokens: MAX_COMPLETION_TOKENS,
        stream: true,
        stream_options: { include_usage: true },
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
      signal: controller.signal,
    });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      console.error("[api/chat] Groq error", upstream.status, detail);
      res
        .status(upstream.ok ? 502 : upstream.status)
        .json({ error: `Groq request failed (${upstream.status})` });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finishReason = "stop";
    let tokens: number | undefined;
    let closed = false;

    while (!closed) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;

        let chunk: GroqChunk;
        try {
          chunk = JSON.parse(payload) as GroqChunk;
        } catch {
          continue;
        }

        const choice = chunk.choices?.[0];
        if (choice?.finish_reason) finishReason = choice.finish_reason;
        if (chunk.usage?.completion_tokens)
          tokens = chunk.usage.completion_tokens;

        const delta = choice?.delta?.content;
        if (delta) {
          try {
            res.write(`data: ${JSON.stringify({ delta })}\n\n`);
          } catch {
            closed = true;
            break;
          }
        }
      }
    }

    if (!closed) {
      try {
        res.write(
          `data: ${JSON.stringify({ done: true, finishReason, tokens })}\n\n`,
        );
      } catch {
        /* client disconnected */
      }
    }
    res.end();
  } catch (error) {
    if ((error as { name?: string }).name === "AbortError") {
      try {
        res.status(504).json({ error: "Upstream timeout" });
      } catch {
        /* headers already sent */
      }
      return;
    }
    console.error("[api/chat] handler error", error);
    try {
      res.status(500).json({ error: "Unexpected server error" });
    } catch {
      /* headers already sent */
    }
  } finally {
    clearTimeout(timer);
  }
}
