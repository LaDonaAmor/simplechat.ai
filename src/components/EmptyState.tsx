const SUGGESTIONS = [
  "What can you do?",
  "Explain closures in JavaScript",
  "Give me ideas for a side project",
];

export default function EmptyState({
  onPick,
}: {
  onPick: (text: string) => void;
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-4 text-center">
      <div>
        <h2 className="text-xl font-semibold">How can I help you today?</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Ask anything to start the conversation.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
