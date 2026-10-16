import { defaultCardName, KIND_INFO } from "./catalog";
import { downstreamIds, upstreamIds } from "./reach";
import type { Diagram, Rhythm, Wire } from "./types";

export type TraceFocus = { type: "card"; id: string } | { type: "wire"; id: string } | null;

export interface TraceLine {
  id: string;
  text: string;
  tone: "in" | "out" | "text" | "label";
}

export interface TraceView {
  lines: TraceLine[];
  notes: string[];
  copyText: string;
}

const EMPTY_SENTENCE = "Add a service, then draw where its data comes from.";

function cardName(diagram: Diagram, id: string): string {
  return diagram.cards.find((card) => card.id === id)?.name.trim() || "Unnamed card";
}

function rhythmPhrase(rhythm: Rhythm | undefined): string {
  if (rhythm === "on request") return "on request";
  if (rhythm === "batch") return "in batch";
  if (rhythm === "stream") return "as a stream";
  return "";
}

/** One sentence. The arrow direction and the sentence describe the same movement. */
export function wireSentence(diagram: Diagram, wire: Wire): string {
  const source = cardName(diagram, wire.source);
  const target = cardName(diagram, wire.target);
  const payload = wire.payload.trim() || "…";
  let sentence: string;
  switch (wire.verb) {
    case "reads":
      sentence = `${target} reads ${payload} from ${source}`;
      break;
    case "writes":
      sentence = `${source} writes ${payload} to ${target}`;
      break;
    case "returns":
      sentence = `${source} returns ${payload} to ${target}`;
      break;
    case "publishes":
      sentence = `${source} publishes ${payload} to ${target}`;
      break;
    case "receives":
      sentence = `${target} receives ${payload} from ${source}`;
      break;
  }
  const rhythm = rhythmPhrase(wire.rhythm);
  if (rhythm) sentence = `${sentence} ${rhythm}`;
  return `${sentence}.`;
}

function byPosition(diagram: Diagram, a: string, b: string): number {
  const cardA = diagram.cards.find((card) => card.id === a);
  const cardB = diagram.cards.find((card) => card.id === b);
  const ax = cardA?.position.x ?? 0;
  const bx = cardB?.position.x ?? 0;
  const ay = cardA?.position.y ?? 0;
  const by = cardB?.position.y ?? 0;
  return ax - bx || ay - by || a.localeCompare(b);
}

/**
 * Wires in an order a reader can follow: sources with nothing coming in first,
 * then each movement those cards make. Cycles are appended after the walk.
 */
export function orderedWires(diagram: Diagram): Wire[] {
  const indegree = new Map<string, number>();
  for (const card of diagram.cards) indegree.set(card.id, 0);
  const outgoing = new Map<string, Wire[]>();
  for (const wire of diagram.wires) {
    if (!indegree.has(wire.source)) indegree.set(wire.source, 0);
    indegree.set(wire.target, (indegree.get(wire.target) ?? 0) + 1);
    const list = outgoing.get(wire.source);
    if (list) list.push(wire);
    else outgoing.set(wire.source, [wire]);
  }
  for (const list of outgoing.values()) {
    list.sort((a, b) => byPosition(diagram, a.target, b.target) || a.id.localeCompare(b.id));
  }

  const queue = [...indegree.keys()]
    .filter((id) => (indegree.get(id) ?? 0) === 0)
    .sort((a, b) => byPosition(diagram, a, b));
  const seen = new Set<string>();
  const ordered: Wire[] = [];
  const walked = new Set<string>();

  while (queue.length > 0) {
    queue.sort((a, b) => byPosition(diagram, a, b));
    const id = queue.shift() as string;
    if (walked.has(id)) continue;
    walked.add(id);
    for (const wire of outgoing.get(id) ?? []) {
      if (!seen.has(wire.id)) {
        seen.add(wire.id);
        ordered.push(wire);
      }
      const next = (indegree.get(wire.target) ?? 1) - 1;
      indegree.set(wire.target, next);
      if (next <= 0) queue.push(wire.target);
    }
  }

  if (seen.size < diagram.wires.length) {
    const rest = [...diagram.wires].sort(
      (a, b) => byPosition(diagram, a.source, b.source) || byPosition(diagram, a.target, b.target),
    );
    for (const wire of rest) {
      if (!seen.has(wire.id)) ordered.push(wire);
    }
  }
  return ordered;
}

function namesInOrder(diagram: Diagram, ids: string[]): string[] {
  const known = ids.filter((id) => diagram.cards.some((card) => card.id === id));
  known.sort((a, b) => byPosition(diagram, a, b));
  return known.map((id) => cardName(diagram, id));
}

function listNames(names: string[]): string {
  if (names.length === 0) return "nothing";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function reachLine(diagram: Diagram, cardId: string): string {
  const card = diagram.cards.find((item) => item.id === cardId);
  const name = card?.name.trim() || "This card";
  const upstream = listNames(namesInOrder(diagram, upstreamIds(diagram, cardId)));
  const downstream = listNames(namesInOrder(diagram, downstreamIds(diagram, cardId)));
  return `Upstream of ${name}: ${upstream}. Downstream: ${downstream}.`;
}

export function chartNotes(diagram: Diagram): string[] {
  const notes: string[] = [];
  for (const card of diagram.cards) {
    const info = KIND_INFO[card.kind];
    if (info.group === "store") {
      const written = diagram.wires.some(
        (wire) => wire.target === card.id && (wire.verb === "writes" || wire.verb === "publishes"),
      );
      if (!written) notes.push(`${card.name} has nothing written to it.`);
    }
    if (info.group === "program") {
      const linked = diagram.wires.some((wire) => wire.source === card.id || wire.target === card.id);
      if (!linked) notes.push(`${card.name} has no wires.`);
    }
  }
  for (const wire of diagram.wires) {
    if (!wire.payload.trim()) {
      notes.push(`The wire from ${cardName(diagram, wire.source)} to ${cardName(diagram, wire.target)} has no payload.`);
    }
  }
  for (const card of diagram.cards) {
    if (card.name.trim() === defaultCardName(card.kind)) {
      notes.push(`${card.name} still has the default name.`);
    }
  }
  return notes;
}

function pack(lines: TraceLine[], diagram: Diagram): TraceView {
  return {
    lines,
    notes: chartNotes(diagram),
    copyText: lines.map((line) => line.text).join("\n"),
  };
}

/** The trace is a pure reading of the graph. It is not a log of a run. */
export function traceDiagram(diagram: Diagram, focus: TraceFocus): TraceView {
  if (focus?.type === "wire") {
    const wire = diagram.wires.find((item) => item.id === focus.id);
    if (wire) {
      return pack(
        [{ id: wire.id, text: wireSentence(diagram, wire), tone: wire.verb === "reads" || wire.verb === "receives" ? "in" : "out" }],
        diagram,
      );
    }
  }

  if (focus?.type === "card") {
    const card = diagram.cards.find((item) => item.id === focus.id);
    if (card) {
      const incoming = diagram.wires.filter((wire) => wire.target === card.id);
      const outgoing = diagram.wires.filter((wire) => wire.source === card.id);
      const lines: TraceLine[] = [{ id: "arrives", text: "Arrives", tone: "label" }];
      if (incoming.length === 0) {
        lines.push({ id: "arrives-empty", text: "Nothing arrives.", tone: "in" });
      } else {
        for (const wire of incoming) {
          lines.push({ id: `in-${wire.id}`, text: wireSentence(diagram, wire), tone: "in" });
        }
      }
      lines.push({ id: "leaves", text: "Leaves", tone: "label" });
      if (outgoing.length === 0) {
        lines.push({ id: "leaves-empty", text: "Nothing leaves.", tone: "out" });
      } else {
        for (const wire of outgoing) {
          lines.push({ id: `out-${wire.id}`, text: wireSentence(diagram, wire), tone: "out" });
        }
      }
      lines.push({ id: "reach", text: reachLine(diagram, card.id), tone: "text" });
      return pack(lines, diagram);
    }
  }

  if (diagram.cards.length === 0 || diagram.wires.length === 0) {
    const text =
      diagram.cards.length === 0
        ? EMPTY_SENTENCE
        : "Draw a wire from an output port to an input port.";
    return pack([{ id: "empty", text, tone: "text" }], diagram);
  }

  const wires = orderedWires(diagram).slice(0, 6);
  return pack(
    wires.map((wire) => ({ id: wire.id, text: wireSentence(diagram, wire), tone: "text" as const })),
    diagram,
  );
}
