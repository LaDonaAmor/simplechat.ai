export default function TypingIndicator() {
  return (
    <div
      role="status"
      aria-label="SimpleChat is preparing a response"
      className="flex animate-[rise_200ms_ease-out] items-start gap-3 sm:gap-4"
    >
      <span
        aria-hidden="true"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-accent-soft text-xs font-semibold text-accent"
      >
        S
      </span>

      <div className="pt-1">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          SimpleChat is thinking
        </p>
        <span className="flex items-center gap-1.5">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="h-1.5 w-1.5 animate-[pulse-dot_1.2s_ease-in-out_infinite] rounded-full bg-accent/70"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
