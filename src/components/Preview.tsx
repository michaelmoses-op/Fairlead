const STAGE_W = 1020;
const STAGE_H = 360;
const CARD_H = 56;

interface Mini {
  name: string;
  owner: string;
  group: string;
  color: string;
  x: number;
  y: number;
  w: number;
}

const MINIS: Mini[] = [
  { name: "Checkout", owner: "customers", group: "Edge", color: "#f0b429", x: 16, y: 138, w: 150 },
  { name: "Customer DB", owner: "CRM vendor", group: "Outside", color: "#e07a3d", x: 16, y: 18, w: 168 },
  { name: "Orders API", owner: "orders team", group: "Program", color: "#79a7ff", x: 220, y: 138, w: 168 },
  { name: "Order snapshots", owner: "AWS prod", group: "Store", color: "#2cb5a0", x: 424, y: 258, w: 220 },
  { name: "Billing", owner: "billing team", group: "Program", color: "#79a7ff", x: 680, y: 138, w: 150 },
  { name: "Invoices", owner: "public edge", group: "Edge", color: "#f0b429", x: 860, y: 138, w: 144 },
];

function rightPort(card: Mini) {
  return { x: card.x + card.w, y: card.y + CARD_H / 2 };
}

function leftPort(card: Mini) {
  return { x: card.x, y: card.y + CARD_H / 2 };
}

function curve(from: Mini, to: Mini) {
  const start = rightPort(from);
  const end = leftPort(to);
  const bend = Math.max(28, (end.x - start.x) * 0.45);
  return `M ${start.x} ${start.y} C ${start.x + bend} ${start.y}, ${end.x - bend} ${end.y}, ${end.x - 2} ${end.y}`;
}

const WIRES: { from: number; to: number; color: string }[] = [
  { from: 0, to: 2, color: "#c9d5de" },
  { from: 1, to: 2, color: "#79a7ff" },
  { from: 2, to: 3, color: "#f0b429" },
  { from: 3, to: 4, color: "#79a7ff" },
  { from: 4, to: 5, color: "#8ec9a0" },
];

export function Preview() {
  return (
    <aside className="preview" aria-label="Preview of the Orders snapshot chart">
      <div className="preview-top">
        <span className="preview-name">Orders snapshot</span>
        <span className="preview-tag">Sample</span>
      </div>
      <div className="preview-stage">
        <svg className="preview-wires" viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} aria-hidden="true">
          <defs>
            <pattern id="preview-dots" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1.1" cy="1.1" r="1.15" fill="#243444" />
            </pattern>
            {WIRES.map((wire, index) => (
              <marker
                key={`${wire.from}-${wire.to}`}
                id={`preview-arrow-${index}`}
                viewBox="0 0 12 12"
                refX="8"
                refY="6"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 1 1.5 L 9 6 L 1 10.5 Z" fill={wire.color} />
              </marker>
            ))}
          </defs>
          <rect width={STAGE_W} height={STAGE_H} fill="#0c141c" />
          <rect width={STAGE_W} height={STAGE_H} fill="url(#preview-dots)" />
          {WIRES.map((wire) => (
            <path
              key={`${wire.from}-${wire.to}`}
              d={curve(MINIS[wire.from], MINIS[wire.to])}
              fill="none"
              stroke={wire.color}
              strokeWidth="2.4"
              markerEnd={`url(#preview-arrow-${WIRES.indexOf(wire)})`}
            />
          ))}
        </svg>
        {MINIS.map((card) => (
          <div
            key={card.name}
            className="mini-card"
            style={{
              left: `${(card.x / STAGE_W) * 100}%`,
              top: `${(card.y / STAGE_H) * 100}%`,
              width: `${(card.w / STAGE_W) * 100}%`,
              height: `${(CARD_H / STAGE_H) * 100}%`,
              ["--cat" as string]: card.color,
            }}
          >
            <p className="k">{card.group}</p>
            <p className="t">{card.name}</p>
            <p className="s">{card.owner}</p>
          </div>
        ))}
      </div>
      <p className="preview-sentence">Orders API writes order snapshot to Order snapshots.</p>
    </aside>
  );
}
