import type { Conversation } from "../types/chat";

export type ExportFormat = "md" | "json";

function slug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "conversation"
  );
}

function download(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function toMarkdown(conversation: Conversation): string {
  const lines = [
    `# ${conversation.title}`,
    "",
    `_Exported ${new Date().toISOString()}_`,
    "",
  ];
  for (const m of conversation.messages) {
    lines.push(
      m.role === "user" ? "## User" : "## Assistant",
      "",
      m.content.trim(),
      "",
    );
  }
  return lines.join("\n");
}

export function exportConversation(
  conversation: Conversation,
  format: ExportFormat,
) {
  if (format === "json") {
    download(
      `${slug(conversation.title)}.json`,
      JSON.stringify(conversation, null, 2),
      "application/json",
    );
  } else {
    download(
      `${slug(conversation.title)}.md`,
      toMarkdown(conversation),
      "text/markdown;charset=utf-8",
    );
  }
}
