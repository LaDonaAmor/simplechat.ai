import { beforeEach, describe, expect, it } from "vitest";
import { loadConversations, saveConversations } from "./storage";

describe("storage", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips valid conversations", () => {
    saveConversations([
      {
        id: "1",
        title: "Hi",
        createdAt: 1,
        messages: [{ id: "m", role: "user", content: "hi" }],
      },
    ]);
    expect(loadConversations()).toHaveLength(1);
  });

  it("filters malformed entries", () => {
    localStorage.setItem(
      "simplechat:conversations",
      JSON.stringify([
        { id: "bad" },
        { id: "2", title: "ok", createdAt: 1, messages: [] },
      ]),
    );
    expect(loadConversations().map((c) => c.id)).toEqual(["2"]);
  });

  it("returns [] on corrupt JSON", () => {
    localStorage.setItem("simplechat:conversations", "{not json");
    expect(loadConversations()).toEqual([]);
  });
});
