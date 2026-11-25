import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { streamChatbotResponse } from "./lib/chatApi";
import {
  loadActiveId,
  loadConversations,
  saveActiveId,
  saveConversations,
} from "./lib/storage";
import type { Conversation, Message } from "./types/chat";
import { deriveTitle } from "./lib/text";
import { useTheme } from "./lib/useTheme";
import { useToast } from "./components/Toast";
import { exportConversation, type ExportFormat } from "./lib/exportChat";

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
        createdAt: Date.now(),
      },
      {
        id: newId(),
        role: "user",
        content: "What can you do?",
        createdAt: Date.now(),
      },
      {
        id: newId(),
        role: "assistant",
        content:
          "I can answer questions, explain topics, and help you brainstorm.",
        createdAt: Date.now(),
      },
    ],
  };
}

function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { toast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = loadConversations();
    return saved.length > 0 ? saved : [seedConversation()];
  });
  const [activeId, setActiveId] = useState<string | null>(
    () => loadActiveId() ?? null,
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => saveConversations(conversations), [conversations]);
  useEffect(() => saveActiveId(activeId), [activeId]);
  useEffect(() => () => abortRef.current?.abort(), []);

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

  const streamReply = useCallback((convId: string, history: Message[]) => {
    const controller = new AbortController();
    abortRef.current = controller;
    const assistantId = newId();
    const startedAt = performance.now();
    let ttftMs: number | undefined;

    setIsStreaming(true);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: assistantId,
                  role: "assistant",
                  content: "",
                  createdAt: Date.now(),
                  streaming: true,
                },
              ],
            }
          : c,
      ),
    );

    const patch = (updater: (m: Message) => Message) =>
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantId ? updater(m) : m,
                ),
              }
            : c,
        ),
      );

    streamChatbotResponse(history, {
      signal: controller.signal,
      onDelta: (delta) => {
        if (ttftMs === undefined) ttftMs = performance.now() - startedAt;
        patch((m) => ({ ...m, content: m.content + delta }));
      },
    })
      .then(({ content, truncated, tokens }) => {
        patch((m) => ({
          ...m,
          content,
          truncated,
          streaming: false,
          stats: {
            latencyMs: Math.round(performance.now() - startedAt),
            ttftMs: ttftMs ? Math.round(ttftMs) : undefined,
            tokens,
          },
        }));
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    messages: c.messages.flatMap((m) =>
                      m.id === assistantId
                        ? m.content.trim()
                          ? [{ ...m, streaming: false, truncated: true }]
                          : []
                        : [m],
                    ),
                  }
                : c,
            ),
          );
          return;
        }
        console.error(err);
        patch((m) => ({
          ...m,
          content: "Sorry, something went wrong. Please try again.",
          error: true,
          streaming: false,
        }));
      })
      .finally(() => {
        setIsStreaming(false);
        if (abortRef.current === controller) abortRef.current = null;
      });
  }, []);

  function handleSend(text: string) {
    if (!activeConversation || isStreaming) return;
    const userMessage: Message = {
      id: newId(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };
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
    streamReply(convId, history);
  }

  function handleStop() {
    abortRef.current?.abort();
  }

  function handleRegenerate(convId: string) {
    if (isStreaming) return;
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;
    const lastUserIndex = conv.messages.map((m) => m.role).lastIndexOf("user");
    if (lastUserIndex === -1) return;
    const history = conv.messages.slice(0, lastUserIndex + 1);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, messages: history } : c)),
    );
    streamReply(convId, history);
  }

  function handleEditMessage(convId: string, messageId: string, text: string) {
    if (isStreaming) return;
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;
    const index = conv.messages.findIndex((m) => m.id === messageId);
    if (index === -1) return;
    const edited: Message = { ...conv.messages[index], content: text };
    const history = [...conv.messages.slice(0, index), edited];
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              title: index === 0 ? deriveTitle(text) : c.title,
              messages: history,
            }
          : c,
      ),
    );
    streamReply(convId, history);
  }

  function handleDelete(id: string) {
    const index = conversations.findIndex((c) => c.id === id);
    if (index === -1) return;
    const removed = conversations[index];
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((current) => {
      if (current !== id) return current;
      const remaining = conversations.filter((c) => c.id !== id);
      return remaining[0]?.id ?? null;
    });
    toast({
      message: `Deleted “${removed.title}”`,
      actionLabel: "Undo",
      onAction: () =>
        setConversations((prev) => {
          if (prev.some((c) => c.id === removed.id)) return prev;
          const next = [...prev];
          next.splice(Math.min(index, next.length), 0, removed);
          return next;
        }),
    });
  }

  function handleClearAll() {
    if (conversations.length === 0) return;
    const snapshot = conversations;
    setConversations([]);
    setActiveId(null);
    toast({
      message: `Cleared ${snapshot.length} conversation${snapshot.length === 1 ? "" : "s"}`,
      actionLabel: "Undo",
      onAction: () => {
        setConversations(snapshot);
        setActiveId(snapshot[0]?.id ?? null);
      },
    });
  }

  function handleExport(convId: string, format: ExportFormat) {
    const conv = conversations.find((c) => c.id === convId);
    if (conv) exportConversation(conv, format);
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
        onClearAll={handleClearAll}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <ChatWindow
          conversation={activeConversation}
          isSending={isStreaming}
          onSend={handleSend}
          onStop={handleStop}
          onOpenSidebar={() => setSidebarOpen(true)}
          isSidebarOpen={sidebarOpen}
          onRegenerate={handleRegenerate}
          onEditMessage={handleEditMessage}
          onExport={handleExport}
        />
      </main>
    </div>
  );
}

export default App;
