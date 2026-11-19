import { useEffect, useRef, useState } from "react";
import { SendIcon } from "./icons";

interface ComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function Composer({ onSend, disabled }: ComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  function handleSend() {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
    textareaRef.current?.focus();
  }

  const canSend = Boolean(value.trim()) && !disabled;

  return (
    <div className="mx-auto w-full max-w-2xl px-3 pb-3 sm:px-6 sm:pb-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="rounded-2xl border border-line bg-surface p-2 shadow-[0_1px_2px_rgba(28,27,24,0.04),0_8px_24px_-16px_rgba(28,27,24,0.25)] transition focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/15"
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder="Message SimpleChat"
            aria-label="Message"
            className="max-h-40 min-h-7 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-1.5 text-[15px] leading-6 text-ink placeholder:text-muted focus:outline-none"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted enabled:hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <SendIcon className="h-4.5 w-4.5" />
          </button>
        </div>
      </form>
      <p className="mt-2 px-1 text-center text-[11px] text-muted">
        Enter to send &middot; Shift + Enter for a new line
      </p>
    </div>
  );
}
