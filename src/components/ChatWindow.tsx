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
  isSidebarOpen: boolean;
}

export default function ChatWindow({
  conversation,
  isSending,
  onSend,
  onOpenSidebar,
  isSidebarOpen,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bottom = bottomRef.current;
    if (!bottom) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    bottom.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "end",
    });
  }, [conversation?.id, conversation?.messages.length, isSending]);

  if (!conversation) {
    return (
      <section className="grid min-h-0 flex-1 place-items-center px-6 text-center">
        <div>
          <p className="font-serif text-2xl">No conversation selected</p>
          <p className="mt-2 text-sm text-muted">
            Choose a conversation or start a new one.
          </p>
        </div>
      </section>
    );
  }

  const isEmpty = conversation.messages.length === 0;

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-paper">
      <header className="flex h-14 sm:h-18 shrink-0 items-center gap-3 border-b border-line/80 bg-paper/90 px-4 sm:px-8">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open conversations"
          aria-controls="conversation-sidebar"
          aria-expanded={isSidebarOpen}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-muted transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 md:hidden"
        >
          <MenuIcon className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">
            {conversation.title}
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
        {isEmpty && !isSending ? (
          <EmptyState onPick={onSend} />
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:gap-10 sm:px-8 sm:py-10">
            {conversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isSending && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <Composer onSend={onSend} disabled={isSending} />
    </section>
  );
}
