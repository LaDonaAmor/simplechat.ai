import { useEffect, useRef } from "react";
import type { Conversation } from "../types/chat";
import MessageBubble from "./MessageBubble";
import Composer from "./Composer";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "./EmptyState";

interface ChatWindowProps {
  conversation: Conversation | null;
  isSending: boolean;
  onSend: (text: string) => void;
}

export default function ChatWindow({
  conversation,
  isSending,
  onSend,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation?.id, conversation?.messages.length, isSending]);

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-400">
        Start a new chat
      </div>
    );
  }

  const isEmpty = conversation.messages.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-zinc-200 px-4 py-3 text-center text-sm font-medium dark:border-zinc-700">
        {conversation.title}
      </header>
      <div className="flex-1 overflow-y-auto">
        {isEmpty && !isSending ? (
          <EmptyState onPick={onSend} />
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
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
