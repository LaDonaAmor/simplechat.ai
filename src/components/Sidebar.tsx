import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { Conversation } from "../types/chat";
import { groupByRecency } from "../lib/conversations";
import { useSidebarWidth } from "../lib/useSidebarSize";
import {
  ChatIcon,
  CloseIcon,
  MoonIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SunIcon,
  TrashIcon,
} from "./icons";
import type { Theme } from "../lib/useTheme";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const iconButton =
  "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

export default function Sidebar({
  conversations,
  activeId,
  isOpen,
  onClose,
  onSelect,
  onNew,
  onRename,
  onDelete,
  onClearAll,
  theme,
  onToggleTheme,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const {
    width,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    reset,
  } = useSidebarWidth();

  const q = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      q
        ? conversations.filter(
            (c) =>
              c.title.toLowerCase().includes(q) ||
              c.messages.some((m) => m.content.toLowerCase().includes(q)),
          )
        : [],
    [conversations, q],
  );
  const groups = useMemo(() => groupByRecency(conversations), [conversations]);

  function finishRename() {
    if (editingId && draft.trim()) onRename(editingId, draft.trim());
    setEditingId(null);
  }

  const renderItem = (conversation: Conversation) => {
    const isActive = conversation.id === activeId;
    const isEditing = editingId === conversation.id;
    return (
      <li key={conversation.id}>
        <div
          className={`group flex min-h-11 items-center gap-2 rounded-xl px-2 transition ${
            isActive
              ? "bg-accent-soft text-accent"
              : "text-ink hover:bg-surface-2"
          }`}
        >
          <ChatIcon
            className={`ml-1 h-4 w-4 shrink-0 ${isActive ? "text-accent" : "text-muted"}`}
          />
          {isEditing ? (
            <input
              autoFocus
              aria-label="Conversation title"
              value={draft}
              maxLength={80}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={finishRename}
              onKeyDown={(event) => {
                if (event.key === "Enter") finishRename();
                if (event.key === "Escape") setEditingId(null);
              }}
              className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
            />
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  onSelect(conversation.id);
                  onClose();
                }}
                aria-current={isActive ? "page" : undefined}
                title={conversation.title}
                className="min-w-0 flex-1 truncate py-2 text-left text-[13px] font-medium"
              >
                {conversation.title}
              </button>
              <div className="flex shrink-0 items-center opacity-100 transition-opacity md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100 md:group-focus-within:pointer-events-auto md:group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(conversation.id);
                    setDraft(conversation.title);
                  }}
                  aria-label={`Rename ${conversation.title}`}
                  title="Rename conversation"
                  className={iconButton}
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(conversation.id)}
                  aria-label={`Delete ${conversation.title}`}
                  title="Delete conversation"
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
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      <aside
        id="conversation-sidebar"
        aria-label="Conversation navigation"
        style={{ "--sb-w": `${width}px` } as CSSProperties}
        data-resizing={isDragging || undefined}
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(86vw,310px)] flex-col border-r border-line bg-surface transition-transform duration-200 data-[resizing]:transition-none md:relative md:z-auto md:w-(--sb-w) md:transition-transform md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 pb-4 pt-6">
          <a
            href="/"
            aria-label="SimpleChat home"
            className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <img
              src={
                theme === "dark"
                  ? "/logo-horizontal-dark.png"
                  : "/logo-horizontal.png"
              }
              alt="SimpleChat"
              className="h-10 w-auto"
            />
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close conversations"
            className={`${iconButton} md:hidden`}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={onNew}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-medium text-on-accent shadow-[0_8px_20px_-12px_rgb(53_91_69/70%)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <PlusIcon className="h-4 w-4" />
            Start a new chat
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
              className="w-full rounded-xl border border-line bg-paper py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-accent"
            />
          </div>
        </div>

        <div className="mx-4 border-t border-line" />

        <nav
          aria-label="Conversation list"
          className="min-h-0 flex-1 overflow-y-auto px-4 py-5"
        >
          <div className="mb-3 flex items-center justify-between px-3">
            <p className="text-[14px] font-medium text-muted">
              {q ? "Results" : "History"}
            </p>
            <span className="text-[11px] tabular-nums text-muted">
              {q ? results.length : conversations.length}
            </span>
          </div>

          {q ? (
            results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line px-4 py-5">
                <p className="text-sm font-medium">No matches</p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Try a different search term.
                </p>
              </div>
            ) : (
              <ul className="space-y-1">{results.map(renderItem)}</ul>
            )
          ) : groups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line px-4 py-5">
              <p className="text-sm font-medium">Nothing here yet</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Start a chat and it will appear here.
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <section key={group.label} className="mb-5">
                <h2 className="px-3 pb-2 text-[11px] font-medium text-muted">
                  {group.label}
                </h2>
                <ul className="space-y-1">{group.items.map(renderItem)}</ul>
              </section>
            ))
          )}
        </nav>

        <div className="border-t border-line px-4 py-4">
          <div className="mb-3 flex items-center gap-3 px-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-accent">
              SC
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">Your workspace</p>
              <p className="mt-0.5 text-[10px] text-muted">
                Conversations are stored locally
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
              title={theme === "dark" ? "Light theme" : "Dark theme"}
              className={iconButton}
            >
              {theme === "dark" ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {conversations.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-muted transition hover:bg-surface-2 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
            >
              Clear all conversations
            </button>
          )}
        </div>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={reset}
          className="absolute inset-y-0 -right-1 z-10 hidden w-2 cursor-col-resize touch-none select-none md:block after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] after:bg-transparent after:transition hover:after:bg-accent/40"
        />
      </aside>
    </>
  );
}
