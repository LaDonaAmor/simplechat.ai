import { useEffect, useRef, useState } from "react";

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
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
      className="mx-auto w-full max-w-3xl px-4 pb-4"
    >
      <div className="flex items-end gap-2 rounded-2xl border border-zinc-300 bg-white p-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
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
          placeholder="Send a message..."
          className="max-h-40 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-1.5 outline-none"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="rounded-xl bg-zinc-800 px-4 py-2 text-sm text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Send
        </button>
      </div>
    </form>
  );
}
