const SUGGESTIONS = [
  "What can you help me with?",
  "Explain closures in JavaScript",
  "Help me plan a small side project",
];

export default function EmptyState({
  onPick,
}: {
  onPick: (text: string) => void;
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-8">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          New conversation
        </p>
        <h2 className="font-serif text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
          What&apos;s on your mind?
        </h2>
        <p className="mt-3 max-w-md text-[15px] leading-7 text-muted">
          Ask a question, or start from one of these.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-left text-sm text-ink transition hover:border-accent/40 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <span className="truncate">{s}</span>
            <span
              aria-hidden
              className="text-muted transition group-hover:translate-x-0.5 group-hover:text-accent"
            >
              &rarr;
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
