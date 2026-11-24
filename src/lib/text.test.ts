import { describe, expect, it } from "vitest";
import { deriveTitle } from "./text";

describe("deriveTitle", () => {
  it("collapses whitespace", () => {
    expect(deriveTitle("  hello   world  ")).toBe("hello world");
  });
  it("truncates long titles with an ellipsis", () => {
    expect(deriveTitle("x".repeat(50))).toBe("x".repeat(40) + "…");
  });
});
