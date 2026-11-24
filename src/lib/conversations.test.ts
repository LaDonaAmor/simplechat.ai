import { describe, expect, it } from "vitest";
import { groupByRecency } from "./conversations";
import type { Conversation } from "../types/chat";

const make = (id: string, createdAt: number): Conversation => ({
  id,
  title: id,
  createdAt,
  messages: [],
});

describe("groupByRecency", () => {
  it("buckets conversations by recency", () => {
    const now = new Date(2025, 0, 10, 12, 0, 0);
    const day = 86_400_000;
    const groups = groupByRecency(
      [
        make("today", now.getTime()),
        make("yesterday", now.getTime() - day),
        make("week", now.getTime() - 3 * day),
        make("old", now.getTime() - 30 * day),
      ],
      now,
    );
    expect(groups.map((g) => g.label)).toEqual([
      "Today",
      "Yesterday",
      "Previous 7 days",
      "Older",
    ]);
    expect(groups[0]?.items[0]?.id).toBe("today");
  });
});
