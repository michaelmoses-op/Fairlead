import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import { cloneDiagram, emptyDiagram, loadDocument } from "../graph/document";
import { createCard, duplicateName, uniqueName } from "../graph/factory";
import { createId } from "../graph/ids";
import { pathCardIds, pathWireIds } from "../graph/reach";
import { validateWire } from "../graph/rules";
import { sampleDiagram } from "../graph/sample";
import { readStoredFile, writeStoredFile } from "../graph/storage";
import type { Card, Diagram, Kind, Rhythm, Verb, Wire } from "../graph/types";
import { DOCUMENT_VERSION } from "../graph/types";

export type Selection = { type: "card"; id: string } | { type: "wire"; id: string } | null;

export interface WireDraft {
  sourceId: string;
  targetId: string | null;
}

interface Store {
  diagrams: Diagram[];
  activeId: string | null;
  viewingSample: boolean;
}

export interface ChartsApi {
  diagram: Diagram;
  diagrams: Diagram[];
  viewingSample: boolean;
  selection: Selection;
  draft: WireDraft | null;
  hoveredKind: Kind | null;
  focusWireId: string | null;
  error: string | null;
  clearArmed: boolean;
  fitTick: number;
  activeCards: Set<string> | null;
  activeWires: Set<string> | null;
  select: (selection: Selection) => void;
  setDraft: (draft: WireDraft | null) => void;
  setHoveredKind: (kind: Kind | null) => void;
  clearFocus: () => void;
  dismissError: () => void;
  rename: (name: string) => void;
  newDiagram: () => void;
  duplicate: () => void;
  openDiagram: (id: string) => void;
  deleteDiagram: (id: string) => void;
  openSample: () => void;
  requestFit: () => void;
  clearDiagram: () => void;
  download: () => void;
  importText: (text: string) => void;
  addCard: (kind: Kind, position: { x: number; y: number }) => void;
  moveCards: (moves: { id: string; position: { x: number; y: number } }[]) => void;
  removeCards: (ids: string[]) => void;
  addWire: (source: string, target: string) => void;
  updateWire: (id: string, patch: { verb?: Verb; payload?: string; rhythm?: Rhythm | null }) => string | null;
  reconnectWire: (id: string, source: string, target: string) => void;
  removeWires: (ids: string[]) => void;
  updateCard: (id: string, patch: Partial<Pick<Card, "name" | "owner" | "summary" | "notes">>) => void;
}

const ChartsContext = createContext<ChartsApi | null>(null);

function createInitialStore(openSample: boolean): Store {
  const stored = readStoredFile();
  let diagrams = stored?.diagrams ?? [];
  let activeId = stored?.activeId ?? null;
  if (activeId && !diagrams.some((diagram) => diagram.id === activeId)) activeId = null;
  if (!openSample && diagrams.length === 0) {
    const blank = emptyDiagram(createId(), "Untitled");
    diagrams = [blank];
    activeId = blank.id;
  }
  if (!activeId && diagrams[0]) activeId = diagrams[0].id;
  return { diagrams, activeId, viewingSample: openSample };
}

export function ChartsProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const [store, setStore] = useState<Store>(() => createInitialStore(params.get("sample") === "orders"));
  const [selection, setSelection] = useState<Selection>(null);
  const [draft, setDraft] = useState<WireDraft | null>(null);
  const [hoveredKind, setHoveredKind] = useState<Kind | null>(null);
  const [focusWireId, setFocusWireId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clearArmed, setClearArmed] = useState(false);
  const [fitTick, setFitTick] = useState(0);
  const sample = useMemo(() => sampleDiagram(), []);

  const diagram = store.viewingSample
    ? sample
    : (store.diagrams.find((item) => item.id === store.activeId) ?? store.diagrams[0] ?? sample);

  const diagramRef = useRef(diagram);
  diagramRef.current = diagram;
  const storeRef = useRef(store);
  storeRef.current = store;

  useEffect(() => {
    if (!store.viewingSample && params.get("sample")) {
      setParams({}, { replace: true });
    }
  }, [store.viewingSample, params, setParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current = storeRef.current;
      writeStoredFile({
        version: DOCUMENT_VERSION,
        diagrams: current.diagrams,
        activeId: current.activeId,
      });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [store.diagrams, store.activeId]);

  useEffect(() => {
    const flush = () => {
      const current = storeRef.current;
      writeStoredFile({
        version: DOCUMENT_VERSION,
        diagrams: current.diagrams,
        activeId: current.activeId,
      });
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(null), 5200);
    return () => window.clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!clearArmed) return;
    const timer = window.setTimeout(() => setClearArmed(false), 3500);
    return () => window.clearTimeout(timer);
  }, [clearArmed]);

  useEffect(() => {
    document.title = `${diagram.name} · Fairlead`;
  }, [diagram.name]);

  const commit = useCallback((mutate: (diagram: Diagram) => Diagram) => {
    setStore((prev) => {
      if (prev.viewingSample) {
        const names = prev.diagrams.map((item) => item.name);
        const forked = cloneDiagram(
          sampleDiagram(),
          createId(),
          uniqueName(`${sampleDiagram().name} - Copy`, names),
        );
        return {
          diagrams: [...prev.diagrams, mutate(forked)],
          activeId: forked.id,
          viewingSample: false,
        };
      }
      if (!prev.activeId) return prev;
      return {
        ...prev,
        diagrams: prev.diagrams.map((item) => (item.id === prev.activeId ? mutate(item) : item)),
      };
    });
  }, []);

  const select = useCallback((next: Selection) => {
    setSelection(next);
    setFocusWireId((current) => (next?.type === "wire" && next.id === current ? current : null));
    setClearArmed(false);
  }, []);

  const activeCards = useMemo(() => {
    if (selection?.type !== "card") return null;
    if (!diagram.cards.some((card) => card.id === selection.id)) return null;
    return pathCardIds(diagram, selection.id);
  }, [diagram, selection]);

  const activeWires = useMemo(() => {
    if (selection?.type !== "card") return null;
    if (!diagram.cards.some((card) => card.id === selection.id)) return null;
    return pathWireIds(diagram, selection.id);
  }, [diagram, selection]);

  const leaveSampleUrl = useCallback(() => {
    setParams({}, { replace: true });
  }, [setParams]);

  const api = useMemo<ChartsApi>(() => {
    return {
      diagram,
      diagrams: store.diagrams,
      viewingSample: store.viewingSample,
      selection,
      draft,
      hoveredKind,
      focusWireId,
      error,
      clearArmed,
      fitTick,
      activeCards,
      activeWires,
      select,
      setDraft,
      setHoveredKind,
      clearFocus: () => setFocusWireId(null),
      dismissError: () => setError(null),
      rename: (name: string) => {
        commit((current) => ({ ...current, name }));
      },
      newDiagram: () => {
        setStore((prev) => {
          const created = emptyDiagram(createId(), uniqueName("Untitled", prev.diagrams.map((item) => item.name)));
          return {
            diagrams: [...prev.diagrams, created],
            activeId: created.id,
            viewingSample: false,
          };
        });
        setSelection(null);
        setFocusWireId(null);
        setClearArmed(false);
        leaveSampleUrl();
      },
      duplicate: () => {
        const source = diagramRef.current;
        const copy = cloneDiagram(source, createId(), source.name);
        setStore((prev) => {
          const created = { ...copy, name: duplicateName(source.name, prev.diagrams.map((item) => item.name)) };
          return {
            diagrams: [...prev.diagrams, created],
            activeId: created.id,
            viewingSample: false,
          };
        });
        setSelection(null);
        setFocusWireId(null);
        setClearArmed(false);
        setFitTick((tick) => tick + 1);
        leaveSampleUrl();
      },
      openDiagram: (id: string) => {
        setStore((prev) => ({ ...prev, activeId: id, viewingSample: false }));
        setSelection(null);
        setFocusWireId(null);
        setClearArmed(false);
        setFitTick((tick) => tick + 1);
        leaveSampleUrl();
      },
      deleteDiagram: (id: string) => {
        const removingOpen = !storeRef.current.viewingSample && storeRef.current.activeId === id;
        setStore((prev) => {
          const index = prev.diagrams.findIndex((item) => item.id === id);
          const remaining = prev.diagrams.filter((item) => item.id !== id);
          if (remaining.length === 0) {
            const blank = emptyDiagram(createId(), "Untitled");
            return {
              diagrams: [blank],
              activeId: blank.id,
              viewingSample: prev.viewingSample,
            };
          }
          const neighbor = remaining[Math.max(0, index - 1)] ?? remaining[0];
          return {
            diagrams: remaining,
            activeId: prev.activeId === id ? neighbor.id : prev.activeId,
            viewingSample: prev.viewingSample && prev.activeId === id ? false : prev.viewingSample,
          };
        });
        if (removingOpen) {
          setSelection(null);
          setFocusWireId(null);
          setClearArmed(false);
          setFitTick((tick) => tick + 1);
          leaveSampleUrl();
        }
      },
      openSample: () => {
        setStore((prev) => ({ ...prev, viewingSample: true }));
        setSelection(null);
        setFocusWireId(null);
        setClearArmed(false);
        setFitTick((tick) => tick + 1);
        setParams({ sample: "orders" }, { replace: true });
      },
      requestFit: () => setFitTick((tick) => tick + 1),
      clearDiagram: () => {
        if (!clearArmed) {
          setClearArmed(true);
          return;
        }
        setClearArmed(false);
        commit((current) => ({ ...current, cards: [], wires: [] }));
        setSelection(null);
        setFocusWireId(null);
      },
      download: () => {
        const currentStore = storeRef.current;
        const currentDiagram = diagramRef.current;
        const diagrams = currentStore.viewingSample
          ? [...currentStore.diagrams.filter((item) => item.id !== currentDiagram.id), currentDiagram]
          : currentStore.diagrams;
        const file = {
          version: DOCUMENT_VERSION,
          activeId: currentStore.viewingSample ? currentDiagram.id : currentStore.activeId,
          diagrams,
        };
        const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "fairlead-diagrams.json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      },
      importText: (text: string) => {
        const result = loadDocument(text);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        const confirmed = window.confirm("Replace the diagrams saved in this browser with this file?");
        if (!confirmed) return;
        let diagrams = result.file.diagrams;
        let activeId = result.file.activeId;
        if (diagrams.length === 0) {
          const blank = emptyDiagram(createId(), "Untitled");
          diagrams = [blank];
          activeId = blank.id;
        }
        setStore({ diagrams, activeId, viewingSample: false });
        setSelection(null);
        setFocusWireId(null);
        setClearArmed(false);
        setError(null);
        setFitTick((tick) => tick + 1);
        leaveSampleUrl();
      },
      addCard: (kind: Kind, position: { x: number; y: number }) => {
        const card = createCard(kind, position);
        commit((current) => ({ ...current, cards: [...current.cards, card] }));
        setSelection({ type: "card", id: card.id });
        setFocusWireId(null);
      },
      moveCards: (moves) => {
        if (moves.length === 0) return;
        const positions = new Map(moves.map((move) => [move.id, move.position]));
        commit((current) => ({
          ...current,
          cards: current.cards.map((card) => {
            const position = positions.get(card.id);
            return position ? { ...card, position } : card;
          }),
        }));
      },
      removeCards: (ids: string[]) => {
        if (ids.length === 0) return;
        const idSet = new Set(ids);
        const removedWires = diagramRef.current.wires
          .filter((wire) => idSet.has(wire.source) || idSet.has(wire.target))
          .map((wire) => wire.id);
        commit((current) => ({
          ...current,
          cards: current.cards.filter((card) => !idSet.has(card.id)),
          wires: current.wires.filter((wire) => !idSet.has(wire.source) && !idSet.has(wire.target)),
        }));
        setSelection((current) => {
          if (!current) return current;
          if (current.type === "card" && idSet.has(current.id)) return null;
          if (current.type === "wire" && removedWires.includes(current.id)) return null;
          return current;
        });
      },
      addWire: (source: string, target: string) => {
        const wire: Wire = {
          id: createId(),
          source,
          target,
          verb: "writes",
          payload: "",
        };
        const check = validateWire(diagramRef.current, wire);
        if (!check.ok) return;
        commit((current) => {
          if (!validateWire(current, wire).ok) return current;
          return { ...current, wires: [...current.wires, wire] };
        });
        setSelection({ type: "wire", id: wire.id });
        setFocusWireId(wire.id);
      },
      updateWire: (id, patch) => {
        const current = diagramRef.current.wires.find((wire) => wire.id === id);
        if (!current) return "That wire is no longer on the chart.";
        const next: Wire = {
          id: current.id,
          source: current.source,
          target: current.target,
          verb: patch.verb ?? current.verb,
          payload: patch.payload ?? current.payload,
        };
        if ("rhythm" in patch) {
          if (patch.rhythm) next.rhythm = patch.rhythm;
        } else if (current.rhythm) {
          next.rhythm = current.rhythm;
        }
        const check = validateWire(diagramRef.current, next, id);
        if (!check.ok) return check.reason;
        commit((diagramState) => ({
          ...diagramState,
          wires: diagramState.wires.map((wire) => (wire.id === id ? next : wire)),
        }));
        return null;
      },
      reconnectWire: (id, source, target) => {
        const current = diagramRef.current.wires.find((wire) => wire.id === id);
        if (!current) return;
        const next = { ...current, source, target };
        if (!validateWire(diagramRef.current, next, id).ok) return;
        commit((diagramState) => {
          const wire = diagramState.wires.find((item) => item.id === id);
          if (!wire) return diagramState;
          const updated = { ...wire, source, target };
          if (!validateWire(diagramState, updated, id).ok) return diagramState;
          return {
            ...diagramState,
            wires: diagramState.wires.map((item) => (item.id === id ? updated : item)),
          };
        });
        setSelection({ type: "wire", id });
      },
      removeWires: (ids: string[]) => {
        if (ids.length === 0) return;
        const idSet = new Set(ids);
        commit((current) => ({
          ...current,
          wires: current.wires.filter((wire) => !idSet.has(wire.id)),
        }));
        setSelection((current) => (current?.type === "wire" && idSet.has(current.id) ? null : current));
      },
      updateCard: (id, patch) => {
        commit((current) => ({
          ...current,
          cards: current.cards.map((card) => (card.id === id ? { ...card, ...patch } : card)),
        }));
      },
    };
  }, [
    activeCards,
    activeWires,
    clearArmed,
    commit,
    diagram,
    draft,
    error,
    fitTick,
    focusWireId,
    hoveredKind,
    leaveSampleUrl,
    select,
    selection,
    setParams,
    store.diagrams,
    store.viewingSample,
  ]);

  return <ChartsContext.Provider value={api}>{children}</ChartsContext.Provider>;
}

export function useCharts(): ChartsApi {
  const value = useContext(ChartsContext);
  if (!value) throw new Error("useCharts must be used inside ChartsProvider");
  return value;
}
