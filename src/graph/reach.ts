import type { Diagram } from "./types";

function incomingSources(diagram: Diagram): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const wire of diagram.wires) {
    const list = map.get(wire.target);
    if (list) list.push(wire.source);
    else map.set(wire.target, [wire.source]);
  }
  return map;
}

function outgoingTargets(diagram: Diagram): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const wire of diagram.wires) {
    const list = map.get(wire.source);
    if (list) list.push(wire.target);
    else map.set(wire.source, [wire.target]);
  }
  return map;
}

/** Cards that can reach `cardId` by following arrows forward. The card itself is not included. */
export function upstreamIds(diagram: Diagram, cardId: string): string[] {
  const incoming = incomingSources(diagram);
  const found = new Set<string>();
  const stack = [...(incoming.get(cardId) ?? [])];
  while (stack.length > 0) {
    const id = stack.pop() as string;
    if (id === cardId || found.has(id)) continue;
    found.add(id);
    for (const source of incoming.get(id) ?? []) stack.push(source);
  }
  return [...found];
}

/** Cards reachable from `cardId` by following arrows forward. The card itself is not included. */
export function downstreamIds(diagram: Diagram, cardId: string): string[] {
  const outgoing = outgoingTargets(diagram);
  const found = new Set<string>();
  const stack = [...(outgoing.get(cardId) ?? [])];
  while (stack.length > 0) {
    const id = stack.pop() as string;
    if (id === cardId || found.has(id)) continue;
    found.add(id);
    for (const target of outgoing.get(id) ?? []) stack.push(target);
  }
  return [...found];
}

/** Wires that sit on a path into or out of the card. */
export function pathWireIds(diagram: Diagram, cardId: string): Set<string> {
  const wires = new Set<string>();
  const seenIn = new Set<string>();
  const walkIn = (id: string) => {
    if (seenIn.has(id)) return;
    seenIn.add(id);
    for (const wire of diagram.wires) {
      if (wire.target !== id) continue;
      wires.add(wire.id);
      walkIn(wire.source);
    }
  };
  const seenOut = new Set<string>();
  const walkOut = (id: string) => {
    if (seenOut.has(id)) return;
    seenOut.add(id);
    for (const wire of diagram.wires) {
      if (wire.source !== id) continue;
      wires.add(wire.id);
      walkOut(wire.target);
    }
  };
  walkIn(cardId);
  walkOut(cardId);
  return wires;
}

export function pathCardIds(diagram: Diagram, cardId: string): Set<string> {
  const ids = new Set<string>([cardId]);
  for (const id of upstreamIds(diagram, cardId)) ids.add(id);
  for (const id of downstreamIds(diagram, cardId)) ids.add(id);
  return ids;
}
