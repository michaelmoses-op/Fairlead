export type GroupId = "edge" | "program" | "store" | "outside";

export type Kind =
  | "person"
  | "public-api"
  | "service"
  | "worker"
  | "database"
  | "datastore"
  | "cache"
  | "queue"
  | "external-database"
  | "external-service";

export type Verb = "reads" | "writes" | "returns" | "publishes" | "receives";

export type Rhythm = "on request" | "batch" | "stream";

export interface Card {
  id: string;
  kind: Kind;
  name: string;
  owner: string;
  summary: string;
  notes: string;
  position: { x: number; y: number };
}

export interface Wire {
  id: string;
  source: string;
  target: string;
  verb: Verb;
  payload: string;
  rhythm?: Rhythm;
}

export interface Diagram {
  id: string;
  name: string;
  cards: Card[];
  wires: Wire[];
}

export interface FairleadFile {
  version: 1;
  diagrams: Diagram[];
  activeId: string | null;
}

export const DOCUMENT_VERSION = 1 as const;

export const CARD_WIDTH = 208;
export const CARD_HEIGHT = 92;
