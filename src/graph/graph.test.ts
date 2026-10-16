import { describe, expect, it } from "vitest";
import { loadDocument } from "./document";
import { downstreamIds, upstreamIds } from "./reach";
import { validateWire } from "./rules";
import { sampleDiagram } from "./sample";
import { traceDiagram } from "./trace";

describe("sample chart", () => {
  it("keeps every wire valid and reads snapshot, customer row, and invoice in the arrow direction", () => {
    const diagram = sampleDiagram();
    expect(diagram.wires).toHaveLength(5);
    for (const wire of diagram.wires) {
      expect(validateWire(diagram, wire, wire.id).ok).toBe(true);
    }

    const reading = traceDiagram(diagram, null);
    const text = reading.copyText;
    expect(text).toMatch(/snapshot/);
    expect(text).toMatch(/customer row/);
    expect(text).toMatch(/invoice/);
    expect(text).toContain("Orders API receives order request from Checkout");
    expect(text).toContain("Orders API reads customer row from Customer DB");
    expect(text).toContain("Orders API writes order snapshot to Order snapshots");
    expect(text).toContain("Billing reads order snapshot from Order snapshots");
    expect(text).toContain("Billing returns invoice JSON to Invoices");
    expect(reading.lines.length).toBeGreaterThanOrEqual(2);
    expect(reading.lines.length).toBeLessThanOrEqual(6);
  });
});

describe("wire rules", () => {
  it("rejects a self-wire and a duplicate source, target, verb, and payload", () => {
    const diagram = sampleDiagram();
    const card = diagram.cards[0];
    const self = validateWire(diagram, {
      source: card.id,
      target: card.id,
      verb: "writes",
      payload: "loop",
    });
    expect(self.ok).toBe(false);

    const existing = diagram.wires[0];
    const duplicate = validateWire(diagram, {
      source: existing.source,
      target: existing.target,
      verb: existing.verb,
      payload: existing.payload,
    });
    expect(duplicate.ok).toBe(false);

    const sameEndsDifferentPayload = validateWire(diagram, {
      source: existing.source,
      target: existing.target,
      verb: existing.verb,
      payload: "a different payload",
    });
    expect(sameEndsDifferentPayload.ok).toBe(true);

    const back = validateWire(diagram, {
      source: "card-orders-api",
      target: "card-order-snapshots",
      verb: "reads",
      payload: "order snapshot",
    });
    expect(back.ok).toBe(true);
  });
});

describe("trace", () => {
  it("gives an empty chart a single useful sentence", () => {
    const reading = traceDiagram({ id: "empty", name: "Empty", cards: [], wires: [] }, null);
    expect(reading.lines).toHaveLength(1);
    expect(reading.lines[0].text.toLowerCase()).toMatch(/service/);
    expect(reading.copyText.split("\n")).toHaveLength(1);
  });
});

describe("json load", () => {
  it("rejects garbage, drops wires whose ends are missing, and fills missing fields from defaults", () => {
    expect(loadDocument("not json").ok).toBe(false);
    expect(loadDocument("").ok).toBe(false);
    expect(loadDocument("null").ok).toBe(false);
    expect(loadDocument("[]").ok).toBe(false);
    expect(loadDocument("{}").ok).toBe(false);
    expect(loadDocument("42").ok).toBe(false);

    const raw = JSON.stringify({
      diagrams: [
        {
          cards: [
            { id: "a", kind: "service" },
            { id: "b" },
            { id: "c", kind: "database", name: "Ledger", position: { x: 12 } },
          ],
          wires: [
            { id: "w1", source: "a", target: "b", payload: "row" },
            { id: "w2", source: "a", target: "missing", verb: "reads", payload: "x" },
            { source: "nope", target: "a" },
            { id: "w3", source: "b", target: "c", verb: "nope", payload: "page", rhythm: "batch" },
            { id: "w4", source: "c", target: "a", verb: "reads", payload: "kept", rhythm: "whenever" },
          ],
        },
      ],
    });

    const result = loadDocument(raw);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.file.version).toBe(1);
    const diagram = result.file.diagrams[0];
    expect(diagram.name).toBe("Untitled");
    expect(diagram.cards).toHaveLength(3);

    const service = diagram.cards.find((card) => card.id === "a");
    expect(service).toMatchObject({
      kind: "service",
      name: "Service",
      owner: "",
      summary: "",
      notes: "",
      position: { x: 0, y: 0 },
    });

    const second = diagram.cards.find((card) => card.id === "b");
    expect(second?.kind).toBe("service");
    expect(second?.name).toBe("Service");

    const ledger = diagram.cards.find((card) => card.id === "c");
    expect(ledger?.position).toEqual({ x: 12, y: 0 });

    expect(diagram.wires.map((wire) => wire.id).sort()).toEqual(["w1", "w3", "w4"]);
    const filled = diagram.wires.find((wire) => wire.id === "w1");
    expect(filled?.verb).toBe("writes");
    expect(filled?.payload).toBe("row");
    expect(filled?.rhythm).toBeUndefined();

    const keptRhythm = diagram.wires.find((wire) => wire.id === "w3");
    expect(keptRhythm?.verb).toBe("writes");
    expect(keptRhythm?.rhythm).toBe("batch");

    const droppedRhythm = diagram.wires.find((wire) => wire.id === "w4");
    expect(droppedRhythm?.verb).toBe("reads");
    expect(droppedRhythm?.rhythm).toBeUndefined();
  });
});

describe("upstream and downstream", () => {
  it("is correct for Billing and for Order snapshots", () => {
    const diagram = sampleDiagram();
    const billing = diagram.cards.find((card) => card.name === "Billing");
    const snapshots = diagram.cards.find((card) => card.name === "Order snapshots");
    expect(billing).toBeTruthy();
    expect(snapshots).toBeTruthy();
    if (!billing || !snapshots) return;

    const name = (id: string) => diagram.cards.find((card) => card.id === id)?.name;

    expect(new Set(upstreamIds(diagram, billing.id).map(name))).toEqual(
      new Set(["Checkout", "Customer DB", "Orders API", "Order snapshots"]),
    );
    expect(new Set(downstreamIds(diagram, billing.id).map(name))).toEqual(new Set(["Invoices"]));

    expect(new Set(upstreamIds(diagram, snapshots.id).map(name))).toEqual(
      new Set(["Checkout", "Customer DB", "Orders API"]),
    );
    expect(new Set(downstreamIds(diagram, snapshots.id).map(name))).toEqual(
      new Set(["Billing", "Invoices"]),
    );
  });
});
