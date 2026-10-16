import { defaultCardName } from "./catalog";
import { createId } from "./ids";
import type { Card, Kind } from "./types";

export function createCard(kind: Kind, position: { x: number; y: number }): Card {
  return {
    id: createId(),
    kind,
    name: defaultCardName(kind),
    owner: "",
    summary: "",
    notes: "",
    position,
  };
}

export function uniqueName(base: string, taken: string[]): string {
  if (!taken.includes(base)) return base;
  const copy = `${base} copy`;
  if (!taken.includes(copy)) return copy;
  let index = 2;
  while (taken.includes(`${copy} ${index}`)) index += 1;
  return `${copy} ${index}`;
}

export function duplicateName(name: string, taken: string[]): string {
  const copy = `${name} copy`;
  if (!taken.includes(copy)) return copy;
  let index = 2;
  while (taken.includes(`${name} copy ${index}`)) index += 1;
  return `${name} copy ${index}`;
}
