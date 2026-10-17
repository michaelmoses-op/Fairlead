export function Wordmark({ variant = "bar" }: { variant?: "nav" | "bar" | "footer" }) {
  return (
    <span className={`wordmark wordmark-${variant}`}>
      <svg className="wordmark-mark" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#FF8A4C" />
        <path
          d="M5 22H11Q16 22 16 16Q16 10 21 10H27"
          fill="none"
          stroke="#2A3249"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="16" cy="16" r="3.6" fill="#FF8A4C" stroke="#2A3249" strokeWidth="2.4" />
      </svg>
      Fairlead
    </span>
  );
}
