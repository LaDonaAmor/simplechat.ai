interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ApiRequest {
  method?: string;
  body: unknown;
}

interface ApiResponse {
  status: (code: number) => {
    json: (body: Record<string, unknown>) => void;
  };
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
const MAX_COMPLETION_TOKENS = 2048;
const MAX_MESSAGES = 40;
const MAX_TOTAL_CHARS = 8000;
const UPSTREAM_TIMEOUT_MS = 20_000;

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

  try {
    const upstream = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          max_completion_tokens: MAX_COMPLETION_TOKENS,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        }),
        signal: controller.signal,
      },
    );

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error("[api/chat] Groq error", upstream.status, detail);
      res
        .status(upstream.status)
        .json({ error: `Groq request failed (${upstream.status})` });
      return;
    }

    const data = (await upstream.json()) as {
      choices?: {
        message?: { content?: string };
        finish_reason?: string;
      }[];
    };

    const choice = data.choices?.[0];
    const content = choice?.message?.content?.trim() ?? "";
    if (!content) {
      res.status(502).json({ error: "Empty response from Groq" });
      return;
    }

    res.status(200).json({
      content,
      finishReason: choice?.finish_reason ?? "unknown",
    });
  } catch (error) {
    if ((error as { name?: string }).name === "AbortError") {
      res.status(504).json({ error: "Upstream timeout" });
      return;
    }
    console.error("[api/chat] handler error", error);
    res.status(500).json({ error: "Unexpected server error" });
  } finally {
    clearTimeout(timer);
  }
}
