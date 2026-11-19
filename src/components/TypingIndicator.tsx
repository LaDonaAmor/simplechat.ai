export default function TypingIndicator() {
  return (
    <div
      role="status"
      aria-label="Assistant is typing"
      className="flex items-center gap-3"
    >
      <span
        aria-hidden
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line bg-surface font-serif text-[13px] text-accent"
      >
        S
      </span>
      <span className="flex items-center gap-1.5 text-sm text-muted">
        <span className="h-1.5 w-1.5 animate-[pulse-dot_1.2s_ease-in-out_infinite] rounded-full bg-muted" />
        <span className="h-1.5 w-1.5 animate-[pulse-dot_1.2s_ease-in-out_infinite] rounded-full bg-muted [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-[pulse-dot_1.2s_ease-in-out_infinite] rounded-full bg-muted [animation-delay:300ms]" />
      </span>
    </div>
  );
}
