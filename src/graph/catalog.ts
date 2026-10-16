import type { GroupId, Kind, Rhythm, Verb } from "./types";

export interface KindInfo {
  kind: Kind;
  group: GroupId;
  groupLabel: string;
  /** Shown in the palette and used as the card's starting name. */
  label: string;
  description: string;
}

export const GROUP_COLOR: Record<GroupId, string> = {
  edge: "#f0b429",
  program: "#79a7ff",
  store: "#2cb5a0",
  outside: "#e07a3d",
};

export const VERB_COLOR: Record<Verb, string> = {
  reads: "#79a7ff",
  writes: "#f0b429",
  returns: "#8ec9a0",
  publishes: "#e07a3d",
  receives: "#c9d5de",
};

export const VERBS: Verb[] = ["reads", "writes", "returns", "publishes", "receives"];

export const RHYTHMS: Rhythm[] = ["on request", "batch", "stream"];

export const CATALOG: { id: GroupId; label: string; kinds: KindInfo[] }[] = [
  {
    id: "edge",
    label: "Edge",
    kinds: [
      {
        kind: "person",
        group: "edge",
        groupLabel: "Edge",
        label: "Person or client",
        description: "Someone, or an app, at the edge of the system.",
      },
      {
        kind: "public-api",
        group: "edge",
        groupLabel: "Edge",
        label: "Public API",
        description: "An HTTP edge other people call.",
      },
    ],
  },
  {
    id: "program",
    label: "Program",
    kinds: [
      {
        kind: "service",
        group: "program",
        groupLabel: "Program",
        label: "Service",
        description: "A program that handles a request.",
      },
      {
        kind: "worker",
        group: "program",
        groupLabel: "Program",
        label: "Worker",
        description: "A program that runs on a queue or a clock.",
      },
    ],
  },
  {
    id: "store",
    label: "Store",
    kinds: [
      {
        kind: "database",
        group: "store",
        groupLabel: "Store",
        label: "Database",
        description: "Rows the team owns.",
      },
      {
        kind: "datastore",
        group: "store",
        groupLabel: "Store",
        label: "Datastore",
        description: "Documents or objects the team owns.",
      },
      {
        kind: "cache",
        group: "store",
        groupLabel: "Store",
        label: "Cache",
        description: "A fast copy. Not the source of truth.",
      },
      {
        kind: "queue",
        group: "store",
        groupLabel: "Store",
        label: "Queue",
        description: "Messages waiting for a program.",
      },
    ],
  },
  {
    id: "outside",
    label: "Outside",
    kinds: [
      {
        kind: "external-database",
        group: "outside",
        groupLabel: "Outside",
        label: "External database",
        description: "Rows a vendor or another team owns.",
      },
      {
        kind: "external-service",
        group: "outside",
        groupLabel: "Outside",
        label: "External service",
        description: "A system outside the team that gets called.",
      },
    ],
  },
];

const KIND_LIST = CATALOG.flatMap((group) => group.kinds);

export const KIND_INFO: Record<Kind, KindInfo> = KIND_LIST.reduce(
  (map, info) => {
    map[info.kind] = info;
    return map;
  },
  {} as Record<Kind, KindInfo>,
);

const KIND_SET = new Set<string>(KIND_LIST.map((info) => info.kind));
const VERB_SET = new Set<string>(VERBS);
const RHYTHM_SET = new Set<string>(RHYTHMS);

export function isKind(value: unknown): value is Kind {
  return typeof value === "string" && KIND_SET.has(value);
}

export function isVerb(value: unknown): value is Verb {
  return typeof value === "string" && VERB_SET.has(value);
}

export function isRhythm(value: unknown): value is Rhythm {
  return typeof value === "string" && RHYTHM_SET.has(value);
}

export function defaultCardName(kind: Kind): string {
  return KIND_INFO[kind].label;
}

export function groupOf(kind: Kind): GroupId {
  return KIND_INFO[kind].group;
}
