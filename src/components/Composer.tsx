import { useEffect, useRef, useState } from "react";
import { SendIcon } from "./icons";

interface ComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function Composer({ onSend, disabled = false }: ComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [value]);

  function handleSend() {
    const text = value.trim();
    if (!text || disabled) return;

    onSend(text);
    setValue("");
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  const canSend = Boolean(value.trim()) && !disabled;

  return (
    <div className="shrink-0 bg-linear-to-t from-paper via-paper to-paper/0 px-3 pb-3 pt-3 sm:px-6 sm:pb-5">
      <div className="mx-auto w-full max-w-3xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
          className="rounded-3xl border border-line bg-surface p-2 shadow-[0_12px_40px_-24px_rgb(31_43_34/35%)] transition focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/10"
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              maxLength={4000}
              placeholder="Ask anything…"
              aria-label="Write a message"
              className="max-h-45 min-h-11 flex-1 resize-none overflow-y-auto bg-transparent px-3 py-2.5 text-sm leading-6 text-ink outline-none placeholder:text-muted sm:px-4"
            />

            <button
              type="submit"
              disabled={!canSend}
              aria-label={disabled ? "Assistant is responding" : "Send message"}
              title="Send message"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-on-accent shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2"
            >
              <SendIcon className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="flex items-center justify-between px-3 pb-1 pt-1">
            <span className="text-[10px] text-muted">
              {disabled
                ? "Preparing a response…"
                : "Your messages stay in this browser"}
            </span>
            <span className="hidden text-[10px] text-muted sm:block">
              Enter to send · Shift + Enter for a new line
            </span>
          </div>
        </form>

        <p className="mt-2 text-center text-[10px] leading-4 text-muted">
          AI can make mistakes. Check important information.
        </p>
      </div>
    </div>
  );
}
