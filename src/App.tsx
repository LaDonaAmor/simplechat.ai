import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { getChatbotResponse } from "./lib/chatApi";
import {
  loadActiveId,
  loadConversations,
  saveActiveId,
  saveConversations,
} from "./lib/storage";
import type { Conversation, Message } from "./types/chat";
import { deriveTitle } from "./lib/text";

const newId = () => crypto.randomUUID();

function seedConversation(): Conversation {
  return {
    id: newId(),
    title: "Welcome",
    createdAt: Date.now(),
    messages: [
      {
        id: newId(),
        role: "assistant",
        content: "Hi! I am your AI assistant. Ask me anything.",
      },
      { id: newId(), role: "user", content: "What can you do?" },
      {
        id: newId(),
        role: "assistant",
        content:
          "I can answer questions, explain topics, and help you brainstorm.",
      },
    ],
  };
}

function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = loadConversations();
    return saved.length > 0 ? saved : [seedConversation()];
  });
  const [activeId, setActiveId] = useState<string | null>(() => {
    const saved = loadActiveId();
    return saved ?? null;
  });
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => saveConversations(conversations), [conversations]);
  useEffect(() => saveActiveId(activeId), [activeId]);

  const activeConversation = useMemo(
    () =>
      conversations.find((c) => c.id === activeId) ?? conversations[0] ?? null,
    [conversations, activeId],
  );

  function handleNew() {
    const existingEmpty = conversations.find((c) => c.messages.length === 0);
    if (existingEmpty) {
      setActiveId(existingEmpty.id);
      setSidebarOpen(false);
      return;
    }
    const conversation: Conversation = {
      id: newId(),
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
    };
    setConversations((prev) => [conversation, ...prev]);
    setActiveId(conversation.id);
    setSidebarOpen(false);
  }

  function handleRename(id: string, title: string) {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c)),
    );
  }

  function handleDelete(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((current) => {
      if (current !== id) return current;
      const remaining = conversations.filter((c) => c.id !== id);
      return remaining[0]?.id ?? null;
    });
  }

  async function handleSend(text: string) {
    if (!activeConversation || isSending) return;
    const userMessage: Message = { id: newId(), role: "user", content: text };
    const history = [...activeConversation.messages, userMessage];
    const convId = activeConversation.id;
    const wasEmpty = activeConversation.messages.length === 0;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              title: wasEmpty ? deriveTitle(text) : c.title,
              messages: history,
            }
          : c,
      ),
    );
    setIsSending(true);

    try {
      const reply = await getChatbotResponse(history);
      const assistantMessage: Message = {
        id: newId(),
        role: "assistant",
        content: reply,
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, assistantMessage] }
            : c,
        ),
      );
    } catch (err) {
      const errorMessage: Message = {
        id: newId(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        error: true,
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, errorMessage] }
            : c,
        ),
      );
      console.error(err);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-paper text-ink">
      <Sidebar
        conversations={conversations}
        activeId={activeConversation?.id ?? null}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={setActiveId}
        onNew={handleNew}
        onRename={handleRename}
        onDelete={handleDelete}
      />
      <main className="flex min-h-0 flex-1 flex-col">
        <ChatWindow
          conversation={activeConversation}
          isSending={isSending}
          onSend={handleSend}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </main>
    </div>
  );
}

export default App;
