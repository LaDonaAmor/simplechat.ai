import type { Conversation, Message } from "../types/chat";

const CONVERSATIONS_KEY = "simplechat:conversations";
const ACTIVE_KEY = "simplechat:activeId";

function isMessage(value: unknown): value is Message {
  if (typeof value !== "object" || value === null) return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string"
  );
}

function isConversation(value: unknown): value is Conversation {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.title === "string" &&
    typeof c.createdAt === "number" &&
    Array.isArray(c.messages) &&
    c.messages.every(isMessage)
  );
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isConversation) : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (error) {
    // e.g. quota exceeded or storage disabled
    console.error("Failed to persist conversations", error);
  }
}

export function loadActiveId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveId(id: string | null): void {
  if (id === null) localStorage.removeItem(ACTIVE_KEY);
  else localStorage.setItem(ACTIVE_KEY, id);
}
