import { useState } from "react";
import type { Conversation } from "../types/chat";
import { ChatIcon, CloseIcon, PencilIcon, PlusIcon, TrashIcon } from "./icons";

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

interface Group {
  label: string;
  items: Conversation[];
}

const iconButton =
  "grid h-7 w-7 place-items-center rounded-md text-muted transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

function groupByRecency(conversations: Conversation[]): Group[] {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfYesterday = startOfToday - 86_400_000;
  const sevenDaysAgo = startOfToday - 6 * 86_400_000;

  const groups: Group[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Older", items: [] },
  ];

  const sorted = [...conversations].sort((a, b) => b.createdAt - a.createdAt);
  for (const c of sorted) {
    if (c.createdAt >= startOfToday) groups[0].items.push(c);
    else if (c.createdAt >= startOfYesterday) groups[1].items.push(c);
    else if (c.createdAt >= sevenDaysAgo) groups[2].items.push(c);
    else groups[3].items.push(c);
  }

  return groups.filter((g) => g.items.length > 0);
}

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
  const groups = groupByRecency(conversations);

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
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
        />
      )}
      <aside
        id="conversation-sidebar"
        aria-label="Conversations"
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-line bg-surface text-ink transition-transform md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 pb-3 pt-5">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid h-7 w-7 place-items-center rounded-md bg-accent-soft font-serif text-[13px] font-medium text-accent"
            >
              S
            </span>
            <span className="font-serif text-[15px] tracking-tight">
              SimpleChat
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close conversations"
            className={`${iconButton} md:hidden`}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={onNew}
            className="flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-ink transition hover:border-accent/40 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <PlusIcon className="h-4 w-4 text-muted" />
            New chat
          </button>
        </div>

        <nav
          aria-label="Conversation list"
          className="flex-1 overflow-y-auto px-2 pb-4"
        >
          {groups.length === 0 && (
            <p className="px-3 py-6 text-sm text-muted">
              No conversations yet.
            </p>
          )}
          {groups.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((c) => {
                  const isActive = c.id === activeId;
                  return (
                    <li key={c.id}>
                      <div
                        className={`group relative flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition ${
                          isActive ? "bg-surface-2" : "hover:bg-surface-2"
                        }`}
                      >
                        {isActive && (
                          <span
                            aria-hidden
                            className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent"
                          />
                        )}
                        <ChatIcon
                          className={`h-4 w-4 shrink-0 ${
                            isActive ? "text-accent" : "text-muted"
                          }`}
                        />
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
                            className="min-w-0 flex-1 rounded-md border border-line bg-surface px-1.5 py-1 text-ink outline-none focus:border-accent/50"
                          />
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                onSelect(c.id);
                                onClose();
                              }}
                              aria-current={isActive ? "page" : undefined}
                              className="min-w-0 flex-1 truncate text-left"
                              title={c.title}
                            >
                              {c.title}
                            </button>
                            <div className="flex items-center gap-0.5 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(c.id);
                                  setDraft(c.title);
                                }}
                                aria-label={`Rename ${c.title}`}
                                className={`${iconButton} hover:text-ink`}
                              >
                                <PencilIcon className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDelete(c.id)}
                                aria-label={`Delete ${c.title}`}
                                className={`${iconButton} hover:text-danger`}
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
