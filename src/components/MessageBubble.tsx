import type { Message } from "../types/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MessageBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <article className="flex animate-[rise_220ms_ease-out] justify-end">
        <div className="max-w-[88%] rounded-[22px] rounded-br-md bg-accent px-4 py-3 text-[14px] leading-7 text-on-accent shadow-sm sm:max-w-[78%] sm:px-5">
          <p className="whitespace-pre-wrap wrap-break-word">
            {message.content}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`flex animate-[rise_220ms_ease-out] items-start gap-3 sm:gap-4 ${
        message.error ? "text-danger" : "text-ink"
      }`}
    >
      <span
        aria-hidden="true"
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl text-xs font-semibold shadow-sm ${
          message.error
            ? "bg-danger/10 text-danger"
            : "bg-accent-soft text-accent"
        }`}
      >
        S
      </span>
      <div
        className={`min-w-0 max-w-[90%] pt-1 text-[14px] leading-7 sm:max-w-[82%] sm:text-[15px] ${
          message.error ? "text-danger" : "text-ink"
        }`}
      >
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          {message.error ? "Couldn’t respond" : "SimpleChat"}
        </p>
        <div className="assistant-markdown min-w-0">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
