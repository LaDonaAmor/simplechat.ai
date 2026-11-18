import { useState } from "react";
import type { Conversation } from "../types/chat";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

const actionClasses =
  "text-xs text-zinc-400 opacity-100 transition hover:text-zinc-100 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100";

export default function Sidebar({
  conversations,
  activeId,
  isOpen,
  onClose,
  onSelect,
  onNew,
  onRename,
  onDelete,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function commit() {
    if (editingId && draft.trim()) onRename(editingId, draft.trim());
    setEditingId(null);
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close conversations"
          onClick={onClose}
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
        />
      )}
      <aside
        id="conversation-sidebar"
        aria-label="Conversations"
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col bg-zinc-900 text-zinc-100 transition-transform md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 p-3">
          <span className="text-sm font-semibold">Chats</span>
          <button
            type="button"
            onClick={onNew}
            className="rounded-md bg-zinc-700 px-2 py-1 text-sm hover:bg-zinc-600"
          >
            + New
          </button>
        </div>

        <nav
          aria-label="Conversation list"
          className="flex-1 overflow-y-auto px-2 pb-2"
        >
          {conversations.length === 0 && (
            <p className="px-2 py-4 text-sm text-zinc-400">
              No conversations yet.
            </p>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center gap-1 rounded-md px-2 py-2 text-sm ${
                c.id === activeId ? "bg-zinc-700" : "hover:bg-zinc-800"
              }`}
            >
              {editingId === c.id ? (
                <input
                  autoFocus
                  aria-label="Conversation title"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={commit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="w-full rounded bg-zinc-800 px-2 py-1 text-zinc-100 outline-none"
                />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(c.id);
                      onClose();
                    }}
                    aria-current={c.id === activeId ? "page" : undefined}
                    className="flex-1 truncate text-left"
                    title={c.title}
                  >
                    {c.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(c.id);
                      setDraft(c.title);
                    }}
                    aria-label={`Rename ${c.title}`}
                    className={actionClasses}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(c.id)}
                    aria-label={`Delete ${c.title}`}
                    className={actionClasses}
                  >
                    Del
                  </button>
                </>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
