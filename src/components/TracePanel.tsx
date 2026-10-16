import { useState } from "react";
import { traceDiagram } from "../graph/trace";
import { useCharts } from "../state/charts";

export function TracePanel() {
  const { diagram, selection } = useCharts();
  const focus = selection ? { type: selection.type, id: selection.id } : null;
  const reading = traceDiagram(diagram, focus);
  const [copied, setCopied] = useState(false);

  async function copyReading() {
    const ok = await writeClipboard(reading.copyText);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="trace-panel" aria-label="Trace">
      <header className="trace-head">
        <h2>Trace</h2>
        <button type="button" className="text-btn" onClick={() => void copyReading()}>
          {copied ? "Copied" : "Copy reading"}
        </button>
      </header>
      {reading.notes.length > 0 && (
        <ul className="trace-notes">
          {reading.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
      <div className="trace-body">
        {reading.lines.map((line) => (
          <p key={line.id} className={lineClass(line.tone, line.id)}>
            {line.text}
          </p>
        ))}
      </div>
    </section>
  );
}

function lineClass(tone: string, id: string): string {
  if (tone === "label") return "trace-label";
  if (id === "reach") return "trace-line trace-line-meta";
  if (tone === "in") return "trace-line trace-line-in";
  if (tone === "out") return "trace-line trace-line-out";
  return "trace-line";
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "true");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
