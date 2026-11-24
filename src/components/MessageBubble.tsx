import type { Message } from "../types/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MessageBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <article className="flex animate-[rise_220ms_ease-out] justify-end">
        <div className="max-w-[88%] rounded-2xl rounded-br-md bg-accent px-4 py-3 text-sm leading-7 text-on-accent sm:max-w-[78%] sm:px-5">
          <p className="whitespace-pre-wrap wrap-break-word">
            {message.content}
          </p>
        </div>
      </article>
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
        className={`min-w-0 max-w-[92%] text-[15px] leading-7 ${
          message.error ? "text-danger" : "text-ink"
        }`}
      >
        <div className="assistant-markdown min-w-0">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
        {message.truncated && (
          <p className="mt-2 text-xs text-muted">
            Response was cut off — try “continue”.
          </p>
        )}
      </div>
    </article>
  );
}
