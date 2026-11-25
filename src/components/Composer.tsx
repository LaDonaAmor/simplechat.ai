import { useEffect, useRef, useState } from "react";
import { SendIcon, StopIcon } from "./icons";

interface ComposerProps {
  onSend: (text: string) => void;
  onStop: () => void;
  streaming?: boolean;
}

export default function Composer({
  onSend,
  onStop,
  streaming = false,
}: ComposerProps) {
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
    if (!text || streaming) return;
    onSend(text);
    setValue("");
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  const canSend = Boolean(value.trim()) && !streaming;

  return (
    <div className="min-w-0 w-full shrink-0 px-3 pt-3 sm:px-6 sm:pb-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-3xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
          className="rounded-2xl border border-line bg-surface p-2"
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
              placeholder="Ask anything..."
              aria-label="Write a message"
              className="max-h-45 min-h-11 flex-1 resize-none overflow-y-auto bg-transparent px-3 py-2.5 text-sm leading-6 text-ink outline-none placeholder:text-muted sm:px-4"
            />
            {streaming ? (
              <button
                type="button"
                onClick={onStop}
                aria-label="Stop generating"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-danger text-on-danger transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/60 focus-visible:ring-offset-2"
              >
                <StopIcon className="h-4.5 w-4.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSend}
                aria-label="Send message"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-on-accent transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2"
              >
                <SendIcon className="h-4.5 w-4.5" />
              </button>
            )}
          </div>
          <p className="px-3 pt-1 text-[11px] text-muted">
            {streaming
              ? "Generating… press Stop to cancel"
              : "Enter to send · Shift + Enter for a new line"}
          </p>
        </form>
        <p className="mt-2 hidden text-center text-[11px] leading-4 text-muted [@media(min-height:680px)]:block">
          AI can make mistakes. Check important information.
        </p>
      </div>
    </div>
  );
}
