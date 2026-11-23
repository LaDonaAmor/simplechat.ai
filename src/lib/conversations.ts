import type { Conversation } from "../types/chat";

export interface ConversationGroup {
  label: string;
  items: Conversation[];
}

type Bucket = "Today" | "Yesterday" | "Previous 7 days" | "Older";

export function groupByRecency(
  conversations: Conversation[],
  now: Date = new Date(),
): ConversationGroup[] {
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfYesterday = startOfToday - 86_400_000;
  const sevenDaysAgo = startOfToday - 6 * 86_400_000;

  const buckets: Record<Bucket, Conversation[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 days": [],
    Older: [],
  };

  for (const conversation of [...conversations].sort(
    (a, b) => b.createdAt - a.createdAt,
  )) {
    const key: Bucket =
      conversation.createdAt >= startOfToday
        ? "Today"
        : conversation.createdAt >= startOfYesterday
          ? "Yesterday"
          : conversation.createdAt >= sevenDaysAgo
            ? "Previous 7 days"
            : "Older";
    buckets[key].push(conversation);
  }

  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}
