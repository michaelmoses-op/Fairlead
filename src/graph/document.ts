import { defaultCardName, isKind, isRhythm, isVerb } from "./catalog";
import { createId } from "./ids";
import type { Card, Diagram, FairleadFile, Kind, Wire } from "./types";
import { DOCUMENT_VERSION } from "./types";

export type LoadResult = { ok: true; file: FairleadFile } | { ok: false; error: string };

const LOAD_ERROR = "Could not read that file. The chart was left in place.";

export function emptyDiagram(id: string, name: string): Diagram {
  return { id, name, cards: [], wires: [] };
}

export function cloneDiagram(diagram: Diagram, id: string, name: string): Diagram {
  const copy = structuredClone(diagram);
  copy.id = id;
  copy.name = name;
  return copy;
}

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function text(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  return value;
}

function normalizeCard(raw: unknown): Card | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const kind: Kind = isKind(record.kind) ? record.kind : "service";
  const id = typeof record.id === "string" && record.id.trim() ? record.id : createId();
  const name = text(record.name, "").trim() || defaultCardName(kind);
  const position = record.position;
  const point = position && typeof position === "object" ? (position as Record<string, unknown>) : {};
  return {
    id,
    kind,
    name,
    owner: text(record.owner, ""),
    summary: text(record.summary, ""),
    notes: text(record.notes, ""),
    position: {
      x: finiteNumber(point.x, 0),
      y: finiteNumber(point.y, 0),
    },
  };
}

function normalizeWire(raw: unknown, cardIds: Set<string>): Wire | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const source = typeof record.source === "string" ? record.source : "";
  const target = typeof record.target === "string" ? record.target : "";
  if (!cardIds.has(source) || !cardIds.has(target)) return null;
  const verb = isVerb(record.verb) ? record.verb : "writes";
  const payload = text(record.payload, "");
  const wire: Wire = {
    id: typeof record.id === "string" && record.id.trim() ? record.id : createId(),
    source,
    target,
    verb,
    payload,
  };
  if (isRhythm(record.rhythm)) wire.rhythm = record.rhythm;
  return wire;
}

function normalizeDiagram(raw: unknown): Diagram | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const cardInputs = Array.isArray(record.cards) ? record.cards : [];
  const cards: Card[] = [];
  const seenCards = new Set<string>();
  for (const input of cardInputs) {
    const card = normalizeCard(input);
    if (!card || seenCards.has(card.id)) continue;
    seenCards.add(card.id);
    cards.push(card);
  }
  const cardIds = new Set(cards.map((card) => card.id));
  const wireInputs = Array.isArray(record.wires) ? record.wires : [];
  const wires: Wire[] = [];
  const seenWires = new Set<string>();
  for (const input of wireInputs) {
    const wire = normalizeWire(input, cardIds);
    if (!wire || seenWires.has(wire.id)) continue;
    seenWires.add(wire.id);
    wires.push(wire);
  }
  const name = text(record.name, "").trim() || "Untitled";
  const id = typeof record.id === "string" && record.id.trim() ? record.id : createId();
  return { id, name, cards, wires };
}

export function loadDocument(input: string): LoadResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    return { ok: false, error: LOAD_ERROR };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: LOAD_ERROR };
  }
  const record = parsed as Record<string, unknown>;
  if (!Array.isArray(record.diagrams)) {
    return { ok: false, error: LOAD_ERROR };
  }
  if (record.diagrams.length > 0 && record.diagrams.every((item) => !item || typeof item !== "object")) {
    return { ok: false, error: LOAD_ERROR };
  }
  const diagrams: Diagram[] = [];
  const seen = new Set<string>();
  for (const item of record.diagrams) {
    const diagram = normalizeDiagram(item);
    if (!diagram || seen.has(diagram.id)) continue;
    seen.add(diagram.id);
    diagrams.push(diagram);
  }
  let activeId = typeof record.activeId === "string" ? record.activeId : null;
  if (!activeId || !diagrams.some((diagram) => diagram.id === activeId)) {
    activeId = diagrams[0]?.id ?? null;
  }
  return {
    ok: true,
    file: {
      version: DOCUMENT_VERSION,
      diagrams,
      activeId,
    },
  };
}

export function serializeDocument(file: FairleadFile): string {
  return JSON.stringify(
    {
      version: DOCUMENT_VERSION,
      activeId: file.activeId,
      diagrams: file.diagrams,
    },
    null,
    2,
  );
}
