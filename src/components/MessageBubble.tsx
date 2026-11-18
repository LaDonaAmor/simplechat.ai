import type { Message } from "../types/chat";

export default function MessageBubble({ message }: { message: Message }) {
  if (message.error) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-2xl border border-red-300 bg-red-50 px-4 py-2 text-[15px] leading-relaxed text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-zinc-800 px-4 py-2 text-[15px] leading-relaxed text-zinc-50">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-100">
        {message.content}
      </div>
    </div>
  );
}
