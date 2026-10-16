import type { Diagram, Verb, Wire } from "./types";

export type RuleResult = { ok: true } | { ok: false; reason: string };

export interface WireDraft {
  source: string;
  target: string;
  verb: Verb;
  payload: string;
}

/**
 * A wire is one movement. Any card may connect to any other card.
 * Cycles are allowed. A card may not connect to itself, and the same
 * source, target, verb, and payload may appear only once.
 */
export function validateWire(diagram: Diagram, draft: WireDraft, ignoreId?: string): RuleResult {
  if (!draft.source || !draft.target) {
    return { ok: false, reason: "Choose a card for both ends." };
  }
  const source = diagram.cards.some((card) => card.id === draft.source);
  const target = diagram.cards.some((card) => card.id === draft.target);
  if (!source || !target) {
    return { ok: false, reason: "Choose a card for both ends." };
  }
  if (draft.source === draft.target) {
    return { ok: false, reason: "A card cannot connect to itself." };
  }
  const payload = draft.payload.trim();
  const duplicate = diagram.wires.some(
    (wire) =>
      wire.id !== ignoreId &&
      wire.source === draft.source &&
      wire.target === draft.target &&
      wire.verb === draft.verb &&
      wire.payload.trim() === payload,
  );
  if (duplicate) {
    return { ok: false, reason: "That wire is already on the chart." };
  }
  return { ok: true };
}

export function wiresTouching(diagram: Diagram, cardId: string): { incoming: Wire[]; outgoing: Wire[] } {
  const incoming: Wire[] = [];
  const outgoing: Wire[] = [];
  for (const wire of diagram.wires) {
    if (wire.target === cardId) incoming.push(wire);
    if (wire.source === cardId) outgoing.push(wire);
  }
  return { incoming, outgoing };
}
