export function Wordmark({ tone }: { tone: "paper" | "ink" }) {
  return (
    <span className={`wordmark wordmark-${tone}`}>
      <svg className="wordmark-mark" viewBox="0 0 24 24" aria-hidden="true">
        <rect className="wordmark-field" width="24" height="24" rx="6" />
        <path className="wordmark-glyph" d="M5 12h14" />
        <circle className="wordmark-glyph" cx="12" cy="12" r="3.15" />
      </svg>
      Fairlead
    </span>
  );
}
