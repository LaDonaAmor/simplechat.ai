export default function TypingIndicator() {
  return (
    <div
      role="status"
      aria-label="SimpleChat is typing"
      className="flex animate-[rise_200ms_ease-out] items-center gap-3"
    >
      <span
        aria-hidden="true"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-[11px] font-semibold text-accent"
      >
        S
      </span>
      <span className="flex items-center gap-1.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-1.5 w-1.5 animate-[pulse-dot_1.2s_ease-in-out_infinite] rounded-full bg-muted"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
    </div>
  );
}
