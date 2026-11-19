const SUGGESTIONS = [
  {
    label: "Learn something",
    prompt: "Explain a difficult topic in simple terms",
    mark: "01",
  },
  {
    label: "Build an idea",
    prompt: "Help me plan a small web development project",
    mark: "02",
  },
  {
    label: "Write with clarity",
    prompt: "Help me write a clear and friendly email",
    mark: "03",
  },
];

export default function EmptyState({
  onPick,
}: {
  onPick: (text: string) => void;
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-5 py-12 sm:px-8">
      <div className="mb-9 max-w-xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            A fresh conversation
          </span>
        </div>

        <h1 className="font-serif text-[38px] leading-[1.08] tracking-tight text-ink sm:text-5xl">
          A little curiosity
          <br />
          goes a long way.
        </h1>

        <p className="mt-4 max-w-md text-sm leading-7 text-muted sm:text-[15px]">
          Ask a question, think through an idea, or get help with the next thing
          you’re working on.
        </p>
      </div>

      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          Start with a prompt
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => onPick(suggestion.prompt)}
              className="group min-h-29 rounded-2xl border border-line bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_12px_28px_-20px_rgb(31_43_34/45%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <span className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {suggestion.label}
                </span>
                <span className="font-serif text-xs text-accent">
                  {suggestion.mark}
                </span>
              </span>
              <span className="mt-5 block text-[13px] leading-5 text-ink">
                {suggestion.prompt}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
