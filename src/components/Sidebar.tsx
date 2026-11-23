import { useEffect, useRef, useState } from "react";
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

  [...conversations]
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((conversation) => {
      if (conversation.createdAt >= startOfToday) {
        groups[0].items.push(conversation);
      } else if (conversation.createdAt >= startOfYesterday) {
        groups[1].items.push(conversation);
      } else if (conversation.createdAt >= sevenDaysAgo) {
        groups[2].items.push(conversation);
      } else {
        groups[3].items.push(conversation);
      }
    });

  return groups.filter((group) => group.items.length > 0);
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
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Conversation | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const groups = groupByRecency(conversations);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!pendingDelete || !dialog) return;

    dialog.showModal();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, [pendingDelete]);

  function finishRename() {
    if (editingId && draft.trim()) {
      onRename(editingId, draft.trim());
    }
    setEditingId(null);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    onDelete(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-ink/30 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        id="conversation-sidebar"
        aria-label="Conversation navigation"
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(86vw,310px)] flex-col border-r border-line bg-surface transition-transform duration-200 md:static md:z-auto md:w-71.5 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 pb-5 pt-6">
          <a
            href="/"
            aria-label="SimpleChat home"
            className="flex items-center gap-3 rounded-xl"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-accent text-sm font-semibold tracking-tight text-on-accent shadow-sm">
              S
            </span>
            <span>
              <span className="block font-serif text-[19px] leading-5 tracking-[-0.01em]">
                SimpleChat
              </span>
              <span className="mt-1 block text-[11px] tracking-wide text-muted">
                A quieter kind of AI
              </span>
            </span>
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

        <div className="px-4 pb-5">
          <button
            type="button"
            onClick={onNew}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-medium text-on-accent shadow-[0_8px_20px_-12px_rgb(53_91_69/70%)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <PlusIcon className="h-4 w-4" />
            Start a new chat
          </button>
        </div>

        <div className="mx-5 border-t border-line" />

        <nav
          aria-label="Conversation list"
          className="min-h-0 flex-1 overflow-y-auto px-3 py-5"
        >
          <div className="mb-3 flex items-center justify-between px-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              Your conversations
            </p>
            <span className="text-[11px] tabular-nums text-muted">
              {conversations.length}
            </span>
          </div>

          {groups.length === 0 ? (
            <div className="mx-1 rounded-2xl border border-dashed border-line px-4 py-5">
              <p className="text-sm font-medium">Nothing here yet</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Start a chat and it will appear here.
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <section key={group.label} className="mb-5">
                <h2 className="px-2 pb-2 text-[11px] font-medium text-muted">
                  {group.label}
                </h2>
                <ul className="space-y-1">
                  {group.items.map((conversation) => {
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
                            className={`ml-1 h-4 w-4 shrink-0 ${
                              isActive ? "text-accent" : "text-muted"
                            }`}
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
                                if (event.key === "Escape") {
                                  setEditingId(null);
                                }
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

                              <div className="flex shrink-0 items-center opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
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
                                  onClick={() => setPendingDelete(conversation)}
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
                  })}
                </ul>
              </section>
            ))
          )}
        </nav>

        <div className="border-t border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-accent">
              SC
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">Your workspace</p>
              <p className="mt-0.5 text-[11px] text-muted">
                Chats saved on this device
              </p>
            </div>
          </div>
        </div>
      </aside>

      {pendingDelete && (
        <dialog
          ref={dialogRef}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
          onCancel={(event) => {
            event.preventDefault();
            setPendingDelete(null);
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setPendingDelete(null);
            }
          }}
          className="m-auto w-[calc(100%-32px)] max-w-105 rounded-3xl border border-line bg-surface p-0 shadow-2xl backdrop:bg-ink/40"
        >
          <div className="p-6 sm:p-7">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-danger/10 text-danger">
              <TrashIcon className="h-5 w-5" />
            </div>

            <h2
              id="delete-dialog-title"
              className="font-serif text-2xl tracking-[-0.01em]"
            >
              Delete this conversation?
            </h2>

            <p
              id="delete-dialog-description"
              className="mt-3 text-sm leading-6 text-muted"
            >
              <span className="font-medium text-ink">
                “{pendingDelete.title}”
              </span>{" "}
              and its messages will be removed from this device. This can’t be
              undone.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                Keep conversation
              </button>
              <button
                type="button"
                autoFocus
                onClick={confirmDelete}
                className="rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/60 focus-visible:ring-offset-2"
              >
                Delete conversation
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
