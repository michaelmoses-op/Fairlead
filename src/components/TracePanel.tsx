import { useMemo, useState, type ReactNode } from "react";
import { GROUP_COLOR, KIND_INFO, VERB_COLOR } from "../graph/catalog";
import { chartChecks, orderedWires, traceDiagram, wireSentence, wireSentenceParts } from "../graph/trace";
import type { Diagram, GroupId, Wire } from "../graph/types";
import { useCharts } from "../state/charts";

type TraceTab = "reading" | "table" | "checks" | "json";

export function TracePanel() {
  const { diagram, selection, select } = useCharts();
  const [tab, setTab] = useState<TraceTab>("reading");
  const [copied, setCopied] = useState<string | null>(null);
  const [hiddenTip, setHiddenTip] = useState<string | null>(null);
  const focus = selection ? { type: selection.type, id: selection.id } : null;
  const reading = traceDiagram(diagram, focus);
  const listWires = useMemo(() => orderedWires(diagram).slice(0, 6), [diagram]);
  const readingCopy =
    focus?.type === "card"
      ? reading.copyText
      : listWires.length > 0
        ? listWires.map((wire) => wireSentence(diagram, wire)).join("\n")
        : reading.copyText;
  const checks = useMemo(() => chartChecks(diagram), [diagram]);
  const rows = useMemo(() => tableRows(diagram), [diagram]);
  const json = useMemo(() => JSON.stringify(diagram, null, 2), [diagram]);
  const progress = checkProgress(diagram, checks.length);

  async function copy(id: string, text: string) {
    const ok = await writeClipboard(text);
    if (!ok) return;
    setCopied(id);
    window.setTimeout(() => setCopied((current) => (current === id ? null : current)), 1600);
  }

  return (
    <section className="trace-panel" aria-label="Trace">
      <div className="trace-tabs">
        <div className="trace-tablist" role="tablist" aria-label="Trace views">
          <TabButton id="reading" current={tab} onSelect={setTab}>
            Reading
          </TabButton>
          <TabButton id="table" current={tab} onSelect={setTab}>
            Table
          </TabButton>
          <TabButton id="checks" current={tab} onSelect={setTab}>
            Checks
            {checks.length > 0 && <span className="trace-count">{checks.length}</span>}
          </TabButton>
          <TabButton id="json" current={tab} onSelect={setTab}>
            JSON
          </TabButton>
        </div>
        <div className="trace-tab-actions">
          {tab === "reading" && (
            <CopyControl
              id="reading"
              tip="Copy reading"
              copied={copied === "reading"}
              tipHidden={hiddenTip === "reading"}
              onHideTip={setHiddenTip}
              onShowTip={(id) => setHiddenTip((current) => (current === id ? null : current))}
              onCopy={() => void copy("reading", readingCopy)}
            />
          )}
          {tab === "table" && (
            <>
              <CopyControl
                id="rows"
                label="Rows"
                tip="Copy rows"
                copied={copied === "rows"}
                tipHidden={hiddenTip === "rows"}
                onHideTip={setHiddenTip}
                onShowTip={(id) => setHiddenTip((current) => (current === id ? null : current))}
                onCopy={() => void copy("rows", sentenceText(diagram))}
              />
              <CopyControl
                id="markdown"
                label="Markdown"
                tip="Copy Markdown"
                copied={copied === "markdown"}
                tipHidden={hiddenTip === "markdown"}
                onHideTip={setHiddenTip}
                onShowTip={(id) => setHiddenTip((current) => (current === id ? null : current))}
                onCopy={() => void copy("markdown", markdownTable(rows))}
              />
            </>
          )}
          {tab === "json" && (
            <>
              <span className="live-tag">
                <i aria-hidden="true" />
                Live
              </span>
              <CopyControl
                id="json"
                tip="Copy JSON"
                copied={copied === "json"}
                tipHidden={hiddenTip === "json"}
                onHideTip={setHiddenTip}
                onShowTip={(id) => setHiddenTip((current) => (current === id ? null : current))}
                onCopy={() => void copy("json", json)}
              />
            </>
          )}
        </div>
      </div>
      <div className="trace-body" id="trace-panel-body" role="tabpanel" aria-labelledby={`trace-tab-${tab}`}>
        {tab === "reading" &&
          (focus?.type === "card" || listWires.length === 0 ? (
            <Reading lines={reading.lines} diagram={diagram} />
          ) : (
            <ReadingList
              wires={listWires}
              diagram={diagram}
              selectedId={focus?.type === "wire" ? focus.id : null}
              onSelect={(id) => select({ type: "wire", id })}
            />
          ))}
        {tab === "table" && (
          <WireTable
            rows={rows}
            onSelect={(id) => select({ type: "wire", id })}
            onAddPayload={(id) => {
              select({ type: "wire", id });
              window.requestAnimationFrame(() => {
                const field = document.getElementById("wire-payload");
                if (field instanceof HTMLInputElement) field.focus();
              });
            }}
          />
        )}
        {tab === "checks" && (
          <Checks progress={progress} checks={checks} onSelect={(target) => select(target)} />
        )}
        {tab === "json" && <JsonBlock json={json} />}
      </div>
    </section>
  );
}

function TabButton({
  id,
  current,
  onSelect,
  children,
}: {
  id: TraceTab;
  current: TraceTab;
  onSelect: (tab: TraceTab) => void;
  children: ReactNode;
}) {
  const selected = current === id;
  return (
    <button
      type="button"
      role="tab"
      id={`trace-tab-${id}`}
      aria-selected={selected}
      aria-controls="trace-panel-body"
      className={selected ? "trace-tab trace-tab-active" : "trace-tab"}
      onClick={() => onSelect(id)}
    >
      {children}
    </button>
  );
}

function Reading({
  lines,
  diagram,
}: {
  lines: { id: string; text: string; tone: string }[];
  diagram: Diagram;
}) {
  return (
    <>
      {lines.map((line) => {
        const wire = wireForLine(diagram, line.id);
        return (
          <p key={line.id} className={lineClass(line.tone, line.id)}>
            {wire ? <Sentence diagram={diagram} wire={wire} /> : line.text}
          </p>
        );
      })}
    </>
  );
}

function ReadingList({
  wires,
  diagram,
  selectedId,
  onSelect,
}: {
  wires: Wire[];
  diagram: Diagram;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="reading-list">
      {wires.map((wire, index) => (
        <button
          key={wire.id}
          type="button"
          className={wire.id === selectedId ? "reading-row is-selected" : "reading-row"}
          onClick={() => onSelect(wire.id)}
        >
          <span className="reading-num">{String(index + 1).padStart(2, "0")}</span>
          <Sentence diagram={diagram} wire={wire} />
        </button>
      ))}
    </div>
  );
}

function Sentence({ diagram, wire }: { diagram: Diagram; wire: Wire }) {
  const parts = wireSentenceParts(diagram, wire);
  const tokens = parts.map((part, index) => (
    <span key={`${part.role}-${index}`}>
      {index > 0 ? " " : null}
      <span className={`reading-${part.role}`} style={partColor(part)}>
        {part.text}
      </span>
    </span>
  ));
  return <span className="reading-sentence">{tokens}<span className="reading-plain">.</span></span>;
}

function partColor(part: ReturnType<typeof wireSentenceParts>[number]): { color: string } | undefined {
  if (part.role === "name" && part.group) return { color: GROUP_COLOR[part.group] };
  if (part.role === "verb" && part.verb) return { color: VERB_COLOR[part.verb] };
  return undefined;
}

function wireForLine(diagram: Diagram, id: string): Wire | undefined {
  const wireId = id.replace(/^(in|out)-/, "");
  return diagram.wires.find((wire) => wire.id === wireId);
}

function WireTable({
  rows,
  onSelect,
  onAddPayload,
}: {
  rows: TableRow[];
  onSelect: (id: string) => void;
  onAddPayload: (id: string) => void;
}) {
  if (rows.length === 0) {
    return <p className="trace-empty">Draw a wire from an output port to an input port.</p>;
  }
  return (
    <div className="wire-table">
      <div className="wire-head-row">
        <span>From</span>
        <span>Action</span>
        <span>Payload</span>
        <span>To</span>
      </div>
      {rows.map((row) => (
        <button
          key={row.id}
          type="button"
          className="wire-row"
          onClick={(event) => {
            const chip = event.target instanceof Element && event.target.closest(".wire-payload-empty");
            if (chip) onAddPayload(row.id);
            else onSelect(row.id);
          }}
        >
          <NameDot name={row.from} group={row.fromGroup} />
          <span className="wire-verb">{row.verb}</span>
          {row.payload ? (
            <span className="wire-payload">{row.payload}</span>
          ) : (
            <span className="wire-payload wire-payload-empty">add payload</span>
          )}
          <NameDot name={row.to} group={row.toGroup} />
        </button>
      ))}
    </div>
  );
}

function CopyControl({
  id,
  label,
  tip,
  copied,
  tipHidden,
  onHideTip,
  onShowTip,
  onCopy,
}: {
  id: string;
  label?: string;
  tip: string;
  copied: boolean;
  tipHidden: boolean;
  onHideTip: (id: string) => void;
  onShowTip: (id: string) => void;
  onCopy: () => void;
}) {
  return (
    <button
      type="button"
      className={`copy-icon-btn${label ? " has-label" : ""}${copied ? " is-copied" : ""}${tipHidden ? " is-tip-hidden" : ""}`}
      aria-label={tip}
      onPointerDown={() => onHideTip(id)}
      onMouseLeave={() => onShowTip(id)}
      onBlur={() => onShowTip(id)}
      onClick={() => {
        onHideTip(id);
        onCopy();
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {label ? <span className="copy-label">{label}</span> : null}
      <span className="copy-tip" role="tooltip">
        {tip}
      </span>
    </button>
  );
}

function Checks({
  progress,
  checks,
  onSelect,
}: {
  progress: { clear: number; total: number; percent: number };
  checks: ReturnType<typeof chartChecks>;
  onSelect: (target: { type: "card" | "wire"; id: string }) => void;
}) {
  return (
    <div className="checks">
      <div className="check-meter">
        <span>
          {progress.total === 0 ? "Nothing to check yet" : `${progress.clear} of ${progress.total} checks clear`}
        </span>
        <span>{progress.percent}%</span>
      </div>
      <div className="check-bar" aria-hidden="true">
        <span style={{ width: `${progress.percent}%` }} />
      </div>
      {checks.length === 0 ? (
        <p className="trace-empty">Nothing to fix.</p>
      ) : (
        <ul className="check-list">
          {checks.map((check) => (
            <li key={check.id} className="check-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 4l9 16H3z" />
                <path d="M12 10v4M12 17.5v.1" />
              </svg>
              <span>{check.text}</span>
              <button type="button" className="check-action" onClick={() => onSelect(check.target)}>
                {check.actionLabel}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function checkProgress(diagram: Diagram, open: number): { clear: number; total: number; percent: number } {
  let total = diagram.wires.length + diagram.cards.length;
  for (const card of diagram.cards) {
    const group = KIND_INFO[card.kind].group;
    if (group === "store" || group === "program") total += 1;
  }
  const clear = Math.max(0, total - open);
  const percent = total === 0 ? 0 : Math.round((clear / total) * 100);
  return { clear, total, percent };
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function JsonBlock({ json }: { json: string }) {
  const lines = json.split("\n");
  return (
    <div className="json-view">
      {lines.map((line, index) => (
        <div className="json-line" key={index}>
          <span className="json-gutter">{index + 1}</span>
          <span>{colorLine(line)}</span>
        </div>
      ))}
    </div>
  );
}

function NameDot({ name, group }: { name: string; group: GroupId }) {
  return (
    <span className="trace-name">
      <i className="trace-dot" style={{ background: GROUP_COLOR[group] }} aria-hidden="true" />
      <span>{name}</span>
    </span>
  );
}

interface TableRow {
  id: string;
  from: string;
  fromGroup: GroupId;
  verb: string;
  payload: string;
  to: string;
  toGroup: GroupId;
}

function tableRows(diagram: Diagram): TableRow[] {
  return orderedWires(diagram).map((wire) => ({
    id: wire.id,
    from: cardLabel(diagram, wire.source),
    fromGroup: cardGroup(diagram, wire.source),
    verb: wire.verb,
    payload: wire.payload.trim(),
    to: cardLabel(diagram, wire.target),
    toGroup: cardGroup(diagram, wire.target),
  }));
}

function cardLabel(diagram: Diagram, id: string): string {
  return diagram.cards.find((card) => card.id === id)?.name.trim() || "Unnamed card";
}

function cardGroup(diagram: Diagram, id: string): GroupId {
  const card = diagram.cards.find((item) => item.id === id);
  return card ? KIND_INFO[card.kind].group : "generic";
}

function sentenceText(diagram: Diagram): string {
  const sentences = orderedWires(diagram).map((wire) => wireSentence(diagram, wire));
  return sentences.length > 0 ? sentences.join("\n") : "Draw a wire from an output port to an input port.";
}

function markdownTable(rows: TableRow[]): string {
  if (rows.length === 0) return "No wires yet.";
  const body = rows
    .map((row) => `| ${row.from} | ${row.verb} | ${row.payload || "…"} | ${row.to} |`)
    .join("\n");
  return `| From | Action | Payload | To |\n| --- | --- | --- | --- |\n${body}`;
}

function colorLine(line: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /"(?:\\.|[^"\\])*"|[{}\[\],:]/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = re.exec(line))) {
    if (match.index > last) parts.push(line.slice(last, match.index));
    const token = match[0];
    const after = line.slice(match.index + token.length).trimStart();
    const kind = token.startsWith('"') ? (after.startsWith(":") ? "key" : "string") : "punct";
    parts.push(
      <span key={index} className={`json-${kind}`}>
        {token}
      </span>,
    );
    index += 1;
    last = match.index + token.length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}

function lineClass(tone: string, id: string): string {
  if (tone === "label") return "trace-label";
  if (id === "reach") return "trace-line trace-line-meta";
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
