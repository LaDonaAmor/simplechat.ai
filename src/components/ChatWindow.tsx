import { useEffect, useRef } from "react";
import type { Conversation } from "../types/chat";
import MessageBubble from "./MessageBubble";
import Composer from "./Composer";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "./EmptyState";
import { MenuIcon } from "./icons";

interface ChatWindowProps {
  conversation: Conversation | null;
  isSending: boolean;
  onSend: (text: string) => void;
  onOpenSidebar: () => void;
}

export default function ChatWindow({
  conversation,
  isSending,
  onSend,
  onOpenSidebar,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
  }, [conversation?.id, conversation?.messages.length, isSending]);

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted">
        <p className="font-serif text-lg text-ink">No conversation selected</p>
        <p className="text-sm">Start a new chat to begin.</p>
      </div>
    );
  }

  const isEmpty = conversation.messages.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-paper">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-3 sm:px-4">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open conversations"
          className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 md:hidden"
        >
          <MenuIcon className="h-4.5 w-4.5" />
        </button>
        <h1 className="min-w-0 flex-1 truncate font-serif text-[15px] tracking-tight text-ink">
          {conversation.title}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {isEmpty && !isSending ? (
          <EmptyState onPick={onSend} />
        ) : (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6">
            {conversation.messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {isSending && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <Composer onSend={onSend} disabled={isSending} />
    </div>
  );
}
