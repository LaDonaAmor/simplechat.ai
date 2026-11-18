import type { Message } from "../types/chat";

export async function getChatbotResponse(history: Message[]): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) return mockResponse(history);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful, friendly assistant." },
        ...history.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return (data.choices[0].message.content as string).trim();
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
