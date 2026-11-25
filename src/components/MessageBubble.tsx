import { isValidElement, useMemo, useState, type ReactNode } from "react";
import type { Message } from "../types/chat";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCopy } from "../lib/useCopy";
import { CheckIcon, CopyIcon, PencilIcon, RefreshIcon } from "./icons";

interface MessageBubbleProps {
  message: Message;
  isSending?: boolean;
  isLastAssistant?: boolean;
  onRegenerate?: () => void;
  onEdit?: (text: string) => void;
}

function extractText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean")
    return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children);
  }
  return "";
}

function CodeBlock({ children }: { children: ReactNode }) {
  const { copied, copy } = useCopy();
  const code = useMemo(
    () => extractText(children).replace(/\n$/, ""),
    [children],
  );

  return (
    <div className="group/code relative my-4 [&>pre]:my-0">
      <pre>{children}</pre>
      <button
        type="button"
        onClick={() => copy(code)}
        aria-label={copied ? "Copied code" : "Copy code"}
        title="Copy code"
        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg border border-line bg-surface/90 text-muted opacity-0 backdrop-blur transition hover:text-ink focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 group-hover/code:opacity-100"
      >
        {copied ? (
          <CheckIcon className="h-4 w-4" />
        ) : (
          <CopyIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

const markdownComponents: Components = {
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  table: ({ children }) => (
    <div
      className="markdown-table-scroll"
      role="region"
      aria-label="Scrollable response table"
      tabIndex={0}
    >
      <table>{children}</table>
    </div>
  ),
};

function AssistantActions({
  content,
  canRegenerate,
  onRegenerate,
  disabled,
}: {
  content: string;
  canRegenerate: boolean;
  onRegenerate?: () => void;
  disabled: boolean;
}) {
  const { copied, copy } = useCopy();
  const base =
    "inline-flex h-8 items-center justify-center rounded-lg text-xs font-medium transition hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

  return (
    <div className="mt-2 flex items-center gap-1 text-muted">
      <button
        type="button"
        onClick={() => copy(content)}
        aria-label={copied ? "Copied" : "Copy response"}
        title={copied ? "Copied" : "Copy response"}
        className={`${base} w-8 ${copied ? "text-accent" : "hover:text-ink"}`}
      >
        {copied ? (
          <CheckIcon className="h-4 w-4" />
        ) : (
          <CopyIcon className="h-4 w-4" />
        )}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>

      {canRegenerate && (
        <button
          type="button"
          onClick={onRegenerate}
          disabled={disabled}
          aria-label="Regenerate response"
          className={`${base} gap-1.5 px-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <RefreshIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function UserMessage({
  message,
  disabled,
  onEdit,
}: {
  message: Message;
  disabled: boolean;
  onEdit?: (text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);

  if (editing) {
    return (
      <article className="flex justify-end">
        <div className="w-full max-w-[88%] rounded-2xl rounded-br-md border border-line bg-surface p-2 sm:max-w-[78%]">
          <textarea
            autoFocus
            value={draft}
            maxLength={4000}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setEditing(false);
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                const next = draft.trim();
                if (next) {
                  onEdit?.(next);
                  setEditing(false);
                }
              }
            }}
            aria-label="Edit message"
            className="max-h-45 min-h-16 w-full resize-none bg-transparent px-2 py-1.5 text-sm leading-7 text-ink outline-none"
          />
          <div className="mt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!draft.trim()}
              onClick={() => {
                const next = draft.trim();
                if (!next) return;
                onEdit?.(next);
                setEditing(false);
              }}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col items-end">
      <div className="max-w-[88%] rounded-2xl rounded-br-md bg-accent px-4 py-3 text-sm leading-7 text-on-accent sm:max-w-[78%] sm:px-5">
        <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
      </div>

      {onEdit && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setDraft(message.content);
            setEditing(true);
          }}
          aria-label="Edit message"
          title="Edit message"
          className="mt-2 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
      )}
    </article>
  );
}

export default function MessageBubble({
  message,
  isSending = false,
  isLastAssistant = false,
  onRegenerate,
  onEdit,
}: MessageBubbleProps) {
  if (message.role === "user") {
    return (
      <UserMessage message={message} disabled={isSending} onEdit={onEdit} />
    );
  }

  return (
    <article className="flex animate-[rise_220ms_ease-out] items-start gap-3 sm:gap-4">
      <span
        aria-hidden="true"
        className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-semibold ${
          message.error
            ? "bg-danger/10 text-danger"
            : "bg-accent-soft text-accent"
        }`}
      >
        S
      </span>
      <div
        className={`min-w-0 flex-1 max-w-[92%] text-[15px] leading-7 ${
          message.error ? "text-danger" : "text-ink"
        }`}
      >
        <div className="assistant-markdown min-w-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {message.truncated && (
          <p className="mt-2 text-xs text-muted">
            Response was cut off — try “continue”.
          </p>
        )}
        <AssistantActions
          content={message.content}
          disabled={isSending}
          canRegenerate={isLastAssistant && !message.error}
          onRegenerate={onRegenerate}
        />
      </div>
    </article>
  );
}
