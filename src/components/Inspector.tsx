import { useEffect, useState } from "react";
import { KIND_INFO, RHYTHMS, VERBS } from "../graph/catalog";
import { validateWire } from "../graph/rules";
import { wireSentence } from "../graph/trace";
import type { Card, Rhythm, Verb, Wire } from "../graph/types";
import { useCharts } from "../state/charts";
import { KindIcon } from "./KindIcon";
import { GROUP_COLOR } from "../graph/catalog";

export function Inspector() {
  const charts = useCharts();
  const { diagram, selection, draft, hoveredKind } = charts;

  if (draft) {
    return (
      <aside className="inspector">
        <DraftView />
      </aside>
    );
  }

  if (selection?.type === "card") {
    const card = diagram.cards.find((item) => item.id === selection.id);
    if (card) {
      return (
        <aside className="inspector">
          <CardView card={card} />
        </aside>
      );
    }
  }

  if (selection?.type === "wire") {
    const wire = diagram.wires.find((item) => item.id === selection.id);
    if (wire) {
      return (
        <aside className="inspector">
          <WireView wire={wire} />
        </aside>
      );
    }
  }

  if (hoveredKind) {
    const info = KIND_INFO[hoveredKind];
    return (
      <aside className="inspector">
        <p className="inspector-kicker">{info.groupLabel}</p>
        <h2 className="inspector-title">{info.label}</h2>
        <p className="inspector-copy">{info.description}</p>
        <p className="inspector-copy">Click to drop it in the center of the view. Drag it if you already know where it sits.</p>
        <div className="palette-icon inspector-swatch" style={{ color: GROUP_COLOR[info.group] }}>
          <KindIcon group={info.group} />
        </div>
      </aside>
    );
  }

  return (
    <aside className="inspector">
      <p className="inspector-kicker">Chart</p>
      <h2 className="inspector-title">Reading a chart</h2>
      <p className="inspector-copy">
        The arrow is the direction data moves. The verb is the action. The payload is what travels.
      </p>
      <p className="inspector-copy">
        Select a card to see what arrives and what leaves. Select a wire to edit its verb and payload.
      </p>
      <p className="inspector-copy">A request and its response are two wires. One wire never means they talk.</p>
    </aside>
  );
}

function DraftView() {
  const { diagram, draft } = useCharts();
  if (!draft) return null;
  const source = diagram.cards.find((card) => card.id === draft.sourceId);
  const target = draft.targetId ? diagram.cards.find((card) => card.id === draft.targetId) : undefined;
  const sourceName = source?.name.trim() || "This card";
  const sentence = target ? `${sourceName} writes … to ${target.name}.` : `${sourceName} writes …`;
  let problem: string | null = null;
  if (source && target) {
    const check = validateWire(diagram, {
      source: source.id,
      target: target.id,
      verb: "writes",
      payload: "",
    });
    if (!check.ok) problem = check.reason;
  }
  return (
    <>
      <p className="inspector-kicker">Drawing</p>
      <h2 className="inspector-title">Writes</h2>
      <p className="inspector-sentence">{sentence}</p>
      {problem ? <p className="field-error">{problem}</p> : null}
      <p className="inspector-copy">Release on a left port. The arrow will point the way the data moves.</p>
    </>
  );
}

function CardView({ card }: { card: Card }) {
  const { diagram, updateCard, removeCards } = useCharts();
  const info = KIND_INFO[card.kind];
  const incoming = diagram.wires.filter((wire) => wire.target === card.id);
  const outgoing = diagram.wires.filter((wire) => wire.source === card.id);

  return (
    <>
      <p className="inspector-kicker">
        {info.groupLabel} · {info.label}
      </p>
      <h2 className="inspector-title">{card.name.trim() || "Name"}</h2>
      <label className="field">
        <span>Name</span>
        <input
          value={card.name}
          onChange={(event) => updateCard(card.id, { name: event.target.value })}
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <label className="field">
        <span>Owner</span>
        <input
          value={card.owner}
          placeholder="Team, account, or vendor"
          onChange={(event) => updateCard(card.id, { owner: event.target.value })}
          autoComplete="off"
        />
      </label>
      <label className="field">
        <span>Summary</span>
        <input
          value={card.summary}
          placeholder="One line"
          onChange={(event) => updateCard(card.id, { summary: event.target.value })}
        />
      </label>
      <label className="field">
        <span>Notes</span>
        <textarea
          value={card.notes}
          rows={3}
          placeholder="Anything the name does not say"
          onChange={(event) => updateCard(card.id, { notes: event.target.value })}
        />
      </label>
      <div className="io-grid">
        <section className="io-box">
          <h3>Arrives</h3>
          {incoming.length === 0 ? (
            <p>Nothing arrives.</p>
          ) : (
            <ul>
              {incoming.map((wire) => (
                <li key={wire.id}>{wireSentence(diagram, wire)}</li>
              ))}
            </ul>
          )}
        </section>
        <section className="io-box">
          <h3>Leaves</h3>
          {outgoing.length === 0 ? (
            <p>Nothing leaves.</p>
          ) : (
            <ul>
              {outgoing.map((wire) => (
                <li key={wire.id}>{wireSentence(diagram, wire)}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <button type="button" className="text-btn" onClick={() => removeCards([card.id])}>
        Remove card
      </button>
    </>
  );
}

function WireView({ wire }: { wire: Wire }) {
  const { diagram, updateWire, removeWires, focusWireId, clearFocus } = useCharts();
  const [payload, setPayload] = useState(wire.payload);
  const [error, setError] = useState<string | null>(null);
  const source = diagram.cards.find((card) => card.id === wire.source);
  const target = diagram.cards.find((card) => card.id === wire.target);
  const preview = wireSentence(diagram, { ...wire, payload });

  useEffect(() => {
    setPayload(wire.payload);
    setError(null);
  }, [wire.id, wire.payload, wire.verb, wire.rhythm]);

  useEffect(() => {
    if (focusWireId !== wire.id) return;
    const field = document.getElementById("wire-verb");
    if (field instanceof HTMLSelectElement) field.focus();
    clearFocus();
  }, [clearFocus, focusWireId, wire.id]);

  function changeVerb(verb: Verb) {
    const reason = updateWire(wire.id, { verb });
    setError(reason);
  }

  function changePayload(value: string) {
    setPayload(value);
    const reason = updateWire(wire.id, { payload: value });
    setError(reason);
  }

  function changeRhythm(value: string) {
    const rhythm = value ? (value as Rhythm) : null;
    const reason = updateWire(wire.id, { rhythm });
    setError(reason);
  }

  return (
    <>
      <p className="inspector-kicker">Wire</p>
      <h2 className="inspector-title">{capitalize(wire.verb)}</h2>
      <p className="inspector-sentence">{preview}</p>
      <label className="field" htmlFor="wire-verb">
        <span>Verb</span>
        <select id="wire-verb" value={wire.verb} onChange={(event) => changeVerb(event.target.value as Verb)}>
          {VERBS.map((verb) => (
            <option key={verb} value={verb}>
              {verb}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Payload</span>
        <input
          value={payload}
          placeholder="customer row"
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => changePayload(event.target.value)}
          onBlur={() => {
            if (error) setPayload(wire.payload);
          }}
        />
      </label>
      <label className="field">
        <span>Rhythm</span>
        <select value={wire.rhythm ?? ""} onChange={(event) => changeRhythm(event.target.value)}>
          <option value="">No rhythm</option>
          {RHYTHMS.map((rhythm) => (
            <option key={rhythm} value={rhythm}>
              {rhythm}
            </option>
          ))}
        </select>
      </label>
      {error ? <p className="field-error">{error}</p> : null}
      <p className="inspector-copy">
        From {source?.name ?? "a missing card"} to {target?.name ?? "a missing card"}. Drag either end to reconnect it.
      </p>
      <button type="button" className="text-btn" onClick={() => removeWires([wire.id])}>
        Remove wire
      </button>
    </>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
