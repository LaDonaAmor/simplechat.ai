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

const SYSTEM_PROMPT = "You are a helpful, friendly assistant.";

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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // 503 lets the client fall back to mock responses instead of breaking.
    res.status(503).json({ error: "not_configured" });
    return;
  }

  const messages = parseHistory(req.body);
  if (messages.length === 0) {
    res.status(400).json({ error: "No messages provided" });
    return;
  }

  try {
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 500,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    });

    if (!upstream.ok) {
      res
        .status(upstream.status)
        .json({ error: `OpenAI request failed (${upstream.status})` });
      return;
    }

    const data = (await upstream.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!content) {
      res.status(502).json({ error: "Empty response from OpenAI" });
      return;
    }

    res.status(200).json({ content });
  } catch {
    res.status(500).json({ error: "Unexpected server error" });
  }
}
