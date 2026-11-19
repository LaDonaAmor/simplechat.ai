import type { Message } from "../types/chat";

export default function MessageBubble({ message }: { message: Message }) {
  if (message.error) {
    return (
      <div className="flex animate-[rise_200ms_ease-out] gap-3">
        <Avatar />
        <div className="max-w-[85%] rounded-xl border border-danger/30 bg-danger/5 px-4 py-2.5 text-[15px] leading-7 text-danger">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div className="flex animate-[rise_200ms_ease-out] justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-surface-2 px-4 py-2.5 text-[15px] leading-7 text-ink">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex animate-[rise_200ms_ease-out] gap-3">
      <Avatar />
      <div className="min-w-0 max-w-[85%] whitespace-pre-wrap text-[15px] leading-7 text-ink">
        {message.content}
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <span
      aria-hidden
      className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line bg-surface font-serif text-[13px] text-accent"
    >
      S
    </span>
  );
}
