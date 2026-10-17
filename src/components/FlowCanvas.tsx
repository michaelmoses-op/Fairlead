import { useEffect, useMemo, useRef } from "react";
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  Controls,
  MarkerType,
  MiniMap,
  EdgeLabelRenderer,
  getSmoothStepPath,
  ReactFlow,
  SmoothStepEdge,
  useConnection,
  useReactFlow,
  useStoreApi,
  type Connection,
  type Edge,
  type EdgeChange,
  type EdgeProps,
  type Node,
  type NodeChange,
  type OnConnect,
} from "@xyflow/react";
import { GROUP_COLOR, groupOf, isKind, VERB_COLOR } from "../graph/catalog";
import { validateWire } from "../graph/rules";
import { CARD_HEIGHT, CARD_WIDTH } from "../graph/types";
import { useCharts } from "../state/charts";
import { CardNode, type CardNodeData } from "./CardNode";

const nodeTypes = { card: CardNode };
const edgeTypes = { storm: StormEdge };

function StormEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, selected, label } = props;
  const { select, selection, activeWires } = useCharts();
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
    offset: 24,
  });
  const color = typeof style?.stroke === "string" ? style.stroke : "#9DB4FF";
  const text = typeof label === "string" ? label : "";
  const dimmed =
    (activeWires != null && !activeWires.has(id)) || (selection?.type === "wire" && selection.id !== id);
  return (
    <>
      <path
        className="edge-underlay"
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={selected ? 10 : 2.5}
        strokeOpacity={selected ? 0.55 : 0.25}
      />
      <SmoothStepEdge {...props} label={undefined} />
      {text && (
        <EdgeLabelRenderer>
          <div
            className={dimmed ? "edge-label is-dim nopan" : selected ? "edge-label is-selected nopan" : "edge-label nopan"}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              boxShadow: selected ? `inset 0 0 0 1.5px ${color}` : undefined,
            }}
            onClick={(event) => {
              event.stopPropagation();
              select({ type: "wire", id });
            }}
          >
            {text}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export function FlowCanvas() {
  const {
    diagram,
    selection,
    activeCards,
    activeWires,
    fitTick,
    select,
    addCard,
    addWire,
    moveCards,
    removeCards,
    removeWires,
    reconnectWire,
    setDraft,
  } = useCharts();
  const { screenToFlowPosition, fitView } = useReactFlow();
  const store = useStoreApi();
  const diagramRef = useRef(diagram);
  diagramRef.current = diagram;
  const reconnectingId = useRef<string | null>(null);
  const fitViewRef = useRef(fitView);
  fitViewRef.current = fitView;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      if (diagramRef.current.cards.length === 0) return;
      void fitViewRef.current({ padding: 0.18, duration: reduced ? 0 : 280, maxZoom: 1 });
    }, 70);
    return () => window.clearTimeout(timer);
  }, [fitTick]);

  const selectedCardId = selection?.type === "card" ? selection.id : null;
  const nodes = useMemo<Node[]>(() => {
    const lookup = store.getState().nodeLookup;
    return diagram.cards.map((card) => {
      const measured = lookup.get(card.id)?.measured;
      return {
        id: card.id,
        type: "card",
        position: card.position,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        selected: card.id === selectedCardId,
        className: activeCards && !activeCards.has(card.id) ? "is-dim" : undefined,
        data: {
          kind: card.kind,
          name: card.name,
          owner: card.owner,
        } satisfies CardNodeData,
        zIndex: 20,
        style: { width: CARD_WIDTH, height: CARD_HEIGHT },
        ...(measured?.width && measured.height ? { measured: { width: measured.width, height: measured.height } } : {}),
      };
    });
  }, [activeCards, diagram.cards, selectedCardId, store]);

  const edges = useMemo<Edge[]>(() => {
    return diagram.wires.map((wire) => {
      const color = VERB_COLOR[wire.verb];
      const selected = selection?.type === "wire" && selection.id === wire.id;
      const dimmed =
        (activeWires != null && !activeWires.has(wire.id)) || (selection?.type === "wire" && !selected);
      const payload = wire.payload.trim();
      return {
        id: wire.id,
        source: wire.source,
        target: wire.target,
        sourceHandle: "out",
        targetHandle: "in",
        type: "storm",
        selected,
        zIndex: selected ? 12 : 0,
        reconnectable: true,
        interactionWidth: 18,
        className: dimmed ? "is-dim" : selected ? "is-selected" : undefined,
        label: payload ? `${wire.verb} · ${payload}` : wire.verb,
        labelShowBg: true,
        animated: true,
        labelStyle: {
          fill: "#F4F6FC",
          fontSize: 11,
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontWeight: selected ? 700 : 500,
        },
        labelBgStyle: selected
          ? { fill: "#212839", fillOpacity: 1, stroke: color, strokeWidth: 1.5 }
          : { fill: "#2A3249", fillOpacity: 1 },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 11,
        style: {
          stroke: color,
          strokeWidth: selected ? 3.75 : 2.5,
          filter: selected ? `drop-shadow(0 0 8px ${color})` : `drop-shadow(0 0 5px ${color})`,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: selected ? 18 : 16,
          height: selected ? 18 : 16,
          color,
        },
        pathOptions: { borderRadius: 16, offset: 24 },
      };
    });
  }, [activeWires, diagram.wires, selection]);

  function onNodesChange(changes: NodeChange[]) {
    const moves: { id: string; position: { x: number; y: number } }[] = [];
    const removed: string[] = [];
    for (const change of changes) {
      if (change.type === "position" && change.position) {
        moves.push({ id: change.id, position: change.position });
      } else if (change.type === "remove") {
        removed.push(change.id);
      }
    }
    if (moves.length > 0) moveCards(moves);
    if (removed.length > 0) removeCards(removed);
  }

  function onEdgesChange(changes: EdgeChange[]) {
    const removed = changes.filter((change) => change.type === "remove").map((change) => change.id);
    if (removed.length > 0) removeWires(removed);
  }

  const onConnect: OnConnect = (connection) => {
    if (!connection.source || !connection.target) return;
    addWire(connection.source, connection.target);
    setDraft(null);
  };

  function onReconnect(oldEdge: Edge, connection: Connection) {
    if (!connection.source || !connection.target) return;
    reconnectWire(oldEdge.id, connection.source, connection.target);
  }

  return (
    <div className="canvas-wrap">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        onReconnectStart={(_, edge) => {
          reconnectingId.current = edge.id;
        }}
        onReconnectEnd={() => {
          reconnectingId.current = null;
        }}
        onNodeClick={(_, node) => select({ type: "card", id: node.id })}
        onEdgeClick={(_, edge) => select({ type: "wire", id: edge.id })}
        onPaneClick={() => select(null)}
        onNodeDragStart={(_, node) => select({ type: "card", id: node.id })}
        isValidConnection={(connection) => {
          if (!connection.source || !connection.target) return false;
          if (connection.source === connection.target) return false;
          const current = diagramRef.current;
          const existing = reconnectingId.current
            ? current.wires.find((wire) => wire.id === reconnectingId.current)
            : undefined;
          return validateWire(
            current,
            {
              source: connection.source,
              target: connection.target,
              verb: existing?.verb ?? "writes",
              payload: existing?.payload ?? "",
            },
            existing?.id,
          ).ok;
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(event) => {
          event.preventDefault();
          const kind =
            event.dataTransfer.getData("application/fairlead-kind") || event.dataTransfer.getData("text/plain");
          if (!isKind(kind)) return;
          const point = screenToFlowPosition({ x: event.clientX, y: event.clientY });
          addCard(kind, { x: point.x - CARD_WIDTH / 2, y: point.y - CARD_HEIGHT / 2 });
        }}
        minZoom={0.35}
        maxZoom={1.5}
        connectionMode={ConnectionMode.Strict}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: "#FF8A4C", strokeWidth: 2.5 }}
        connectionRadius={36}
        deleteKeyCode={["Backspace", "Delete"]}
        selectionOnDrag={false}
        zoomOnScroll
        elementsSelectable
        edgesReconnectable
        nodesConnectable
        nodesDraggable
        proOptions={{ hideAttribution: false }}
        colorMode="dark"
        elevateNodesOnSelect
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(157, 180, 255, 0.55)" />
        <Controls showInteractive={false} position="bottom-left" />
        <MiniMap
          pannable
          zoomable
          position="bottom-right"
          maskColor="rgba(42, 50, 73, 0.55)"
          bgColor="#343D58"
          nodeStrokeWidth={0}
          nodeColor={(node) => GROUP_COLOR[groupOf((node.data as CardNodeData).kind)]}
        />
        <DraftWatch />
      </ReactFlow>
      {diagram.cards.length === 0 && (
        <div className="canvas-empty">Name a service, then draw where its data comes from.</div>
      )}
    </div>
  );
}

function DraftWatch() {
  const { setDraft } = useCharts();
  const connection = useConnection();
  const sourceId = connection.inProgress ? connection.fromNode.id : null;
  const targetId = connection.inProgress ? (connection.toNode?.id ?? null) : null;

  useEffect(() => {
    if (!sourceId) {
      setDraft(null);
      return;
    }
    setDraft({ sourceId, targetId });
  }, [setDraft, sourceId, targetId]);

  return null;
}
