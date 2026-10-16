import { useEffect, useMemo, useRef } from "react";
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  useConnection,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
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

  const nodes = useMemo<Node[]>(() => {
    return diagram.cards.map((card) => ({
      id: card.id,
      type: "card",
      position: card.position,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      selected: selection?.type === "card" && selection.id === card.id,
      className: activeCards && !activeCards.has(card.id) ? "is-dim" : undefined,
      data: {
        kind: card.kind,
        name: card.name,
        owner: card.owner,
      } satisfies CardNodeData,
      style: { width: CARD_WIDTH, height: CARD_HEIGHT },
    }));
  }, [activeCards, diagram.cards, selection]);

  const edges = useMemo<Edge[]>(() => {
    return diagram.wires.map((wire) => {
      const color = VERB_COLOR[wire.verb];
      const selected = selection?.type === "wire" && selection.id === wire.id;
      const payload = wire.payload.trim();
      return {
        id: wire.id,
        source: wire.source,
        target: wire.target,
        sourceHandle: "out",
        targetHandle: "in",
        type: "smoothstep",
        selected,
        reconnectable: true,
        interactionWidth: 18,
        className: activeWires && !activeWires.has(wire.id) ? "is-dim" : undefined,
        label: payload ? `${wire.verb} · ${payload}` : wire.verb,
        labelShowBg: true,
        labelStyle: {
          fill: "#d5e0e8",
          fontSize: 11,
          fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
          fontWeight: 500,
        },
        labelBgStyle: { fill: "#0c141c", fillOpacity: 0.94 },
        labelBgPadding: [5, 3],
        labelBgBorderRadius: 4,
        style: { stroke: color, strokeWidth: selected ? 2.4 : 1.7 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
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
        connectionLineStyle={{ stroke: "#f0b429", strokeWidth: 2 }}
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
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.3} color="#243444" />
        <Controls showInteractive={false} position="bottom-left" />
        <MiniMap
          pannable
          zoomable
          position="bottom-right"
          maskColor="rgba(8, 12, 16, 0.72)"
          bgColor="rgba(8, 12, 16, 0.72)"
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
