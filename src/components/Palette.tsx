import { useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import { CATALOG, GROUP_COLOR } from "../graph/catalog";
import { CARD_HEIGHT, CARD_WIDTH, type Kind } from "../graph/types";
import { useCharts } from "../state/charts";
import { KindIcon } from "./KindIcon";

export function Palette() {
  const { addCard, setHoveredKind } = useCharts();
  const { screenToFlowPosition } = useReactFlow();
  const dragged = useRef(false);

  function place(kind: Kind) {
    const pane = document.querySelector(".canvas-wrap");
    if (!pane) {
      addCard(kind, { x: 120, y: 80 });
      return;
    }
    const rect = pane.getBoundingClientRect();
    const center = screenToFlowPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    const stagger = (document.querySelectorAll(".react-flow__node").length % 5) * 22;
    addCard(kind, {
      x: center.x - CARD_WIDTH / 2 + stagger,
      y: center.y - CARD_HEIGHT / 2 + stagger,
    });
  }

  return (
    <aside className="palette" onMouseLeave={() => setHoveredKind(null)}>
      <div className="palette-head">
        <h2>Cards</h2>
        <p>Output is the right port. Input is the left. Data moves with the arrow.</p>
      </div>
      {CATALOG.map((group) => (
        <section key={group.id} className="palette-group">
          <h3>{group.label}</h3>
          {group.kinds.map((info) => (
            <button
              key={info.kind}
              type="button"
              className="palette-item"
              draggable
              onMouseEnter={() => setHoveredKind(info.kind)}
              onClick={() => {
                if (dragged.current) return;
                place(info.kind);
              }}
              onDragStart={(event) => {
                dragged.current = true;
                event.dataTransfer.setData("application/fairlead-kind", info.kind);
                event.dataTransfer.setData("text/plain", info.kind);
                event.dataTransfer.effectAllowed = "copy";
              }}
              onDragEnd={() => {
                window.setTimeout(() => {
                  dragged.current = false;
                }, 0);
              }}
            >
              <span className="palette-icon" style={{ color: GROUP_COLOR[info.group] }}>
                <KindIcon group={info.group} />
              </span>
              <span className="palette-copy">
                <span className="palette-name">{info.label}</span>
                <span className="palette-desc">{info.description}</span>
              </span>
            </button>
          ))}
        </section>
      ))}
    </aside>
  );
}
