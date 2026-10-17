import type { GroupId } from "../graph/types";

export function KindIcon({ group }: { group: GroupId }) {
  if (group === "edge") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      </svg>
    );
  }
  if (group === "program") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="5" width="14" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 9.5h8M8 12.5h8M8 15.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (group === "generic") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="5" width="14" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeDasharray="3.2 2.2" />
        <path d="M8.5 12h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (group === "store") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <ellipse cx="12" cy="7" rx="6.5" ry="2.6" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5.5 7v10c0 1.5 2.9 2.6 6.5 2.6s6.5-1.1 6.5-2.6V7" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5.5 12c0 1.5 2.9 2.6 6.5 2.6s6.5-1.1 6.5-2.6" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="6" width="10" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M14 10h5.5M17.2 7.6 19.8 10 17.2 12.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
