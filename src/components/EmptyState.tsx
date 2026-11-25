const SUGGESTIONS = [
  "Explain a difficult topic in simple terms",
  "Help me plan a small web development project",
  "Help me write a clear, friendly email",
];

const FEATURES = [
  "Local-first history",
  "Streaming replies",
  "gpt-oss-20b via Groq",
];

export default function EmptyState({
  onPick,
}: {
  onPick: (text: string) => void;
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-5 py-12 sm:px-8">
      <h1 className="max-w-xl font-serif text-3xl leading-tight tracking-[-0.015em] text-ink sm:text-4xl">
        Ask anything.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-muted">
        SimpleChat keeps your conversations on this device and answers with a
        small open model.
      </p>

      <ul className="mt-5 flex flex-wrap gap-2">
        {FEATURES.map((feature) => (
          <li
            key={feature}
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-medium text-muted"
          >
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onPick(suggestion)}
            className="rounded-xl border border-line bg-surface px-4 py-3 text-left text-sm text-ink transition hover:border-accent/40 hover:bg-surface-2 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
