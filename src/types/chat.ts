export type Role = "user" | "assistant";

export interface MessageStats {
  latencyMs: number;
  ttftMs?: number;
  tokens?: number;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt?: number;
  error?: boolean;
  truncated?: boolean;
  streaming?: boolean;
  stats?: MessageStats;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}
