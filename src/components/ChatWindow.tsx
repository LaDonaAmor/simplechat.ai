import { useCallback, useEffect, useRef, useState } from "react";
import type { Conversation } from "../types/chat";
import MessageBubble from "./MessageBubble";
import Composer from "./Composer";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "./EmptyState";
import { ArrowDownIcon, MenuIcon } from "./icons";

interface ChatWindowProps {
  conversation: Conversation | null;
  isSending: boolean;
  onSend: (text: string) => void;
  onOpenSidebar: () => void;
  isSidebarOpen: boolean;
  onRegenerate: (convId: string) => void;
  onEditMessage: (convId: string, messageId: string, text: string) => void;
}

export default function ChatWindow({
  conversation,
  isSending,
  onSend,
  onOpenSidebar,
  isSidebarOpen,
  onRegenerate,
  onEditMessage,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const prevConvId = useRef<string | null>(null);

  const [showJump, setShowJump] = useState(false);

  // Scroll to the bottom of the conversation
  const scrollToBottom = useCallback((smooth: boolean) => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    bottomRef.current?.scrollIntoView({
      behavior: smooth && !reduceMotion ? "smooth" : "auto",
      block: "end",
    });

    stickRef.current = true;
    setShowJump(false);
  }, []);

  // Track whether the user is near the bottom
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80;

    stickRef.current = near;

    if (near) {
      setShowJump(false);
    }
  }, []);

  // Handle automatic scrolling when messages or conversations change
  useEffect(() => {
    const convChanged = prevConvId.current !== (conversation?.id ?? null);

    prevConvId.current = conversation?.id ?? null;

    if (!convChanged && !stickRef.current) {
      setShowJump(true);
      return;
    }

    scrollToBottom(!convChanged);
  }, [
    conversation?.id,
    conversation?.messages.length,
    isSending,
    scrollToBottom,
  ]);

  // Handle sending messages
  const handleSend = useCallback(
    (text: string) => {
      stickRef.current = true;
      setShowJump(false);
      onSend(text);
    },
    [onSend],
  );

  // Handle when no conversation is selected
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

  const lastAssistantId =
    [...conversation.messages]
      .reverse()
      .find((message) => message.role === "assistant")?.id ?? null;

  return (
    <section className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden bg-paper">
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

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 min-w-0 w-full flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
      >
        {isEmpty && !isSending ? (
          <EmptyState onPick={handleSend} />
        ) : (
          <div className="mx-auto flex min-w-0 w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:gap-10 sm:px-8 sm:py-10">
            {conversation.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isSending={isSending}
                isLastAssistant={message.id === lastAssistantId}
                onRegenerate={() => onRegenerate(conversation.id)}
                onEdit={
                  message.role === "user"
                    ? (text) => onEditMessage(conversation.id, message.id, text)
                    : undefined
                }
              />
            ))}

            {isSending && <TypingIndicator />}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {showJump && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-28 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-2 text-xs font-medium text-ink shadow-lg transition hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:bottom-32"
        >
          <ArrowDownIcon className="h-3.5 w-3.5" />
        </button>
      )}

      <Composer onSend={handleSend} disabled={isSending} />
    </section>
  );
}
