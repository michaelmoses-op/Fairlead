import { Wordmark } from "./Wordmark";

const STAGE_W = 1000;
const STAGE_H = 470;
const CARD_W = 170;
const CARD_H = 64;

interface Mini {
  name: string;
  group: string;
  color: string;
  x: number;
  y: number;
  ports: "in" | "out" | "both";
  selected?: boolean;
}

const MINIS: Mini[] = [
  { name: "Customer DB", group: "Outside", color: "#FFD39B", x: 40, y: 60, ports: "out" },
  { name: "Checkout", group: "Edge", color: "#FFA9BA", x: 40, y: 220, ports: "out" },
  { name: "Orders API", group: "Program", color: "#9DB4FF", x: 290, y: 220, ports: "both", selected: true },
  { name: "Order snapshots", group: "Store", color: "#86F0D6", x: 520, y: 360, ports: "both" },
  { name: "Billing", group: "Program", color: "#9DB4FF", x: 560, y: 220, ports: "both" },
  { name: "Invoices", group: "Edge", color: "#FFA9BA", x: 790, y: 220, ports: "in" },
];

const WIRES: { d: string; color: string }[] = [
  { d: "M210 92C250 92 250 252 290 252", color: "#FFD39B" },
  { d: "M210 252H290", color: "#FFA9BA" },
  { d: "M460 252C490 252 490 392 520 392", color: "#86F0D6" },
  { d: "M690 392C730 392 520 252 560 252", color: "#9DB4FF" },
  { d: "M730 252H790", color: "#FFA9BA" },
];

const PILLS: { label: string; x: number; y: number; color: string }[] = [
  { label: "reads", x: 250, y: 172, color: "#FFD39B" },
  { label: "sends", x: 250, y: 252, color: "#FFA9BA" },
  { label: "writes", x: 490, y: 322, color: "#86F0D6" },
  { label: "publishes", x: 625, y: 322, color: "#9DB4FF" },
  { label: "returns", x: 760, y: 252, color: "#FFA9BA" },
];

export function Preview() {
  return (
    <aside className="preview" aria-label="Preview of the Orders snapshot chart">
      <div className="preview-glow" aria-hidden="true" />
      <div className="preview-window">
        <div className="preview-chrome" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="preview-toolbar">
          <Wordmark variant="bar" />
          <span className="preview-slash" aria-hidden="true">
            /
          </span>
          <span className="preview-name">Orders snapshot</span>
          <div className="preview-pills">
            <span>Diagrams</span>
            <span>Download JSON</span>
          </div>
        </div>
        <div className="preview-stage">
          <svg className="preview-wires" viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} aria-hidden="true">
            {WIRES.map((wire) => (
              <g key={wire.d}>
                <path d={wire.d} fill="none" stroke={wire.color} strokeOpacity="0.25" strokeWidth="2.5" />
                <path className="fl" d={wire.d} fill="none" stroke={wire.color} strokeWidth="2.5" strokeLinecap="round" style={{ color: wire.color }} />
              </g>
            ))}
          </svg>
          {MINIS.map((card) => (
            <div
              key={card.name}
              className={card.selected ? "mini-card is-selected" : "mini-card"}
              style={{
                left: `${(card.x / STAGE_W) * 100}%`,
                top: `${(card.y / STAGE_H) * 100}%`,
                width: `${(CARD_W / STAGE_W) * 100}%`,
                height: `${(CARD_H / STAGE_H) * 100}%`,
                ["--cat" as string]: card.color,
              }}
            >
              {(card.ports === "in" || card.ports === "both") && <span className="mini-port mini-port-in" />}
              <p className="k">{card.group}</p>
              <p className="t">{card.name}</p>
              {(card.ports === "out" || card.ports === "both") && <span className="mini-port mini-port-out" />}
            </div>
          ))}
          {PILLS.map((pill) => (
            <span
              key={pill.label}
              className="wire-pill"
              style={{
                left: `${(pill.x / STAGE_W) * 100}%`,
                top: `${(pill.y / STAGE_H) * 100}%`,
                ["--pill" as string]: pill.color,
              }}
            >
              {pill.label}
            </span>
          ))}
        </div>
        <p className="preview-sentence">Orders API writes order snapshot to Order snapshots.</p>
      </div>
    </aside>
  );
}
