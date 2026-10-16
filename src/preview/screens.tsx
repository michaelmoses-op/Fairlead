import { useId, type ReactNode } from "react";

export type Look = "blueprint" | "phosphor" | "poster" | "lanes" | "index";

export function LookLanding({ look }: { look: Look }) {
  if (look === "blueprint") return <BlueprintLanding />;
  if (look === "phosphor") return <PhosphorLanding />;
  if (look === "poster") return <PosterLanding />;
  if (look === "lanes") return <LanesLanding />;
  return <IndexLanding />;
}

export function LookEditor({ look }: { look: Look }) {
  if (look === "blueprint") return <BlueprintEditor />;
  if (look === "phosphor") return <PhosphorEditor />;
  if (look === "poster") return <PosterEditor />;
  if (look === "lanes") return <LanesEditor />;
  return <IndexEditor />;
}

function BlueprintLanding() {
  return (
    <div className="screen look-blueprint">
      <div className="sheet-frame" />
      <div className="bp-block">
        <p className="bp-mark">Fairlead</p>
        <h1>Orders snapshot</h1>
        <p>Show where the data goes. The arrow is the movement.</p>
        <div className="bp-actions">
          <span className="bp-btn">Open a chart</span>
          <span className="bp-btn">Orders example</span>
        </div>
      </div>
      <Node x={560} y={150} k="Outside" name="Customer DB" sub="CRM vendor" />
      <Node x={560} y={330} k="Edge" name="Checkout" sub="customers" />
      <Node x={820} y={230} k="Program" name="Orders API" sub="orders team" on />
      <Node x={820} y={420} k="Store" name="Order snapshots" sub="AWS prod" />
      <Wires
        color="#7fdbff"
        lines={[
          [728, 181, 820, 259],
          [728, 361, 820, 275],
          [904, 288, 904, 420],
        ]}
      />
      <div className="bp-notes">
        <div>
          <strong>Direction</strong>
          <span>With the arrow</span>
        </div>
        <div>
          <strong>Verb</strong>
          <span>reads</span>
        </div>
        <div>
          <strong>Payload</strong>
          <span>customer row</span>
        </div>
      </div>
    </div>
  );
}

function BlueprintEditor() {
  return (
    <div className="screen look-blueprint">
      <div className="bp-top">
        <p className="bp-mark">Fairlead</p>
        <p className="bp-name">Orders snapshot</p>
        <p className="bp-caption">Orders API reads customer row from Customer DB</p>
      </div>
      <div className="bp-tools">
        {["Person", "Public API", "Service", "Worker", "Database", "Queue", "External"].map((kind) => (
          <span key={kind} className="bp-btn">
            {kind}
          </span>
        ))}
      </div>
      <Node x={70} y={180} k="Edge" name="Checkout" sub="person" />
      <Node x={70} y={320} k="Outside" name="Customer DB" sub="external database" />
      <Node x={400} y={230} k="Program" name="Orders API" sub="service" on />
      <Node x={730} y={300} k="Store" name="Order snapshots" sub="datastore" />
      <Wires
        color="#7fdbff"
        lines={[
          [238, 209, 400, 259],
          [238, 349, 400, 275],
          [568, 275, 730, 329],
        ]}
      />
      <div className="zoom">
        <span>+</span>
        <span>−</span>
        <span>⊡</span>
      </div>
      <div className="map" />
      <div className="bp-table">
        <span className="bp-h">Field</span>
        <span className="bp-h">Value</span>
        <span>Verb</span>
        <span>reads</span>
        <span>Payload</span>
        <span>customer row</span>
        <span>Rhythm</span>
        <span>on request</span>
        <span>Sentence</span>
        <span>Orders API reads customer row from Customer DB on request.</span>
      </div>
    </div>
  );
}

function PhosphorLanding() {
  return (
    <div className="screen look-phosphor">
      <div className="ph-split">
        <div className="ph-copy">
          <p className="ph-prompt">fairlead — local</p>
          <h1>show where the data goes.</h1>
          <p>Each wire is one movement. The trace writes that movement as a sentence. Nothing here connects to a live system.</p>
          <div className="ph-links">
            <span>&gt; open a chart</span>
            <span>&gt; open the orders example</span>
          </div>
        </div>
        <div className="ph-log">
          <p className="ph-line is-on">Orders API reads customer row from Customer DB on request.</p>
          <p className="ph-line">Orders API receives order request from Checkout on request.</p>
          <p className="ph-line">Orders API writes order snapshot to Order snapshots on request.</p>
          <p className="ph-line">Billing reads order snapshot from Order snapshots in batch.</p>
          <p className="ph-line">Billing returns invoice JSON to Invoices on request.</p>
        </div>
      </div>
    </div>
  );
}

function PhosphorEditor() {
  return (
    <div className="screen look-phosphor">
      <div className="ph-bar">
        <strong>fairlead</strong>
        <span>orders</span>
        <span>local</span>
        <span>diagrams</span>
        <span>new</span>
        <span>duplicate</span>
        <span>download</span>
        <span>open</span>
      </div>
      <div className="ph-body">
        <div className="ph-kinds">
          <p className="is-on">person</p>
          <p>public api</p>
          <p>service</p>
          <p>worker</p>
          <p>database</p>
          <p>datastore</p>
          <p>queue</p>
          <p>external database</p>
          <p>external service</p>
        </div>
        <div className="ph-canvas">
          <Node x={40} y={70} k="edge" name="Checkout" />
          <Node x={40} y={190} k="outside" name="Customer DB" />
          <Node x={300} y={120} k="program" name="Orders API" on />
          <Node x={560} y={180} k="store" name="Order snapshots" />
          <Wires
            color="#c6f27a"
            lines={[
              [220, 99, 300, 149],
              [220, 219, 300, 165],
              [480, 165, 560, 209],
            ]}
          />
        </div>
      </div>
      <div className="ph-readout">
        <p className="ph-line is-on">Orders API reads customer row from Customer DB on request.</p>
        <div className="ph-fields">
          <span>verb=reads</span>
          <span>payload=customer row</span>
          <span>rhythm=on request</span>
        </div>
        <p className="ph-line">Orders API receives order request from Checkout on request.</p>
        <p className="ph-line">Orders API writes order snapshot to Order snapshots on request.</p>
        <p className="ph-line">Billing reads order snapshot from Order snapshots in batch.</p>
      </div>
    </div>
  );
}

function PosterLanding() {
  return (
    <div className="screen look-poster">
      <div className="po-landing">
        <div>
          <p className="po-kicker">Local chart</p>
          <h1>Orders API reads customer row from Customer DB.</h1>
          <p className="po-rhythm">On request</p>
          <div className="po-actions">
            <span className="po-primary">Open a chart</span>
            <span className="po-text">Orders example</span>
          </div>
          <p className="po-more">Orders API receives order request from Checkout.</p>
          <p className="po-more">Orders API writes order snapshot to Order snapshots.</p>
        </div>
        <div className="po-figure">
          <Node x={24} y={70} k="Outside" name="Customer DB" />
          <Node x={230} y={150} k="Program" name="Orders API" on />
          <Wires color="#d31212" lines={[[184, 101, 230, 179]]} />
        </div>
      </div>
      <div className="po-foot">
        <span>Direction follows the arrow.</span>
        <span>Verb is reads.</span>
        <span>Payload is customer row.</span>
      </div>
    </div>
  );
}

function PosterEditor() {
  return (
    <div className="screen look-poster">
      <div className="po-editor">
        <div className="po-read">
          <p className="po-kicker">Trace</p>
          <p className="po-sentence">Orders API reads customer row from Customer DB.</p>
          <p className="po-rhythm">On request</p>
          <p className="po-quiet">Orders API receives order request from Checkout.</p>
          <p className="po-quiet">Orders API writes order snapshot to Order snapshots.</p>
          <p className="po-quiet">Billing reads order snapshot from Order snapshots.</p>
          <p className="po-quiet">Billing returns invoice JSON to Invoices.</p>
        </div>
        <div className="po-stage">
          <span className="po-add">Add card</span>
          <Node x={70} y={150} k="Edge" name="Checkout" />
          <Node x={70} y={280} k="Outside" name="Customer DB" />
          <Node x={320} y={200} k="Program" name="Orders API" on />
          <Node x={540} y={300} k="Store" name="Order snapshots" />
          <Wires
            color="#d31212"
            lines={[
              [230, 179, 320, 229],
              [230, 309, 320, 245],
              [480, 245, 540, 329],
            ]}
          />
          <div className="zoom">
            <span>+</span>
            <span>−</span>
          </div>
          <aside className="po-inspector">
            <p className="po-kicker">Wire</p>
            <h2>reads</h2>
            <p>Payload · customer row</p>
            <p>Rhythm · on request</p>
            <p>From Customer DB to Orders API.</p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function LanesLanding() {
  return (
    <div className="screen look-lanes">
      <p className="ln-lead">Name a service, then draw the wire that carries its data.</p>
      <div className="ln-map">
        <Lane label="Edge" />
        <Lane label="Program" />
        <Lane label="Store" />
        <Lane label="Outside" />
      </div>
      <Node x={140} y={96} k="Person" name="Checkout" group="g-edge" />
      <Node x={620} y={96} k="Public API" name="Invoices" group="g-edge" />
      <Node x={300} y={232} k="Service" name="Orders API" group="g-program" on />
      <Node x={680} y={232} k="Service" name="Billing" group="g-program" />
      <Node x={480} y={368} k="Datastore" name="Order snapshots" group="g-store" />
      <Node x={140} y={504} k="External" name="Customer DB" group="g-outside" />
      <Wires
        color="#1d4ed8"
        lines={[
          [308, 125, 300, 232],
          [290, 533, 300, 290],
          [468, 261, 480, 368],
          [830, 261, 770, 125],
        ]}
      />
    </div>
  );
}

function LanesEditor() {
  return (
    <div className="screen look-lanes editor">
      <div className="ln-top">
        <strong>Orders snapshot</strong>
        <span>Local chart. Nothing is connected to your cloud.</span>
      </div>
      <div className="ln-map">
        <Lane label="Edge" add />
        <Lane label="Program" add />
        <Lane label="Store" add />
        <Lane label="Outside" add />
      </div>
      <Node x={130} y={78} k="Person" name="Checkout" group="g-edge" />
      <Node x={480} y={78} k="Public API" name="Invoices" group="g-edge" />
      <Node x={280} y={206} k="Service" name="Orders API" group="g-program" on />
      <Node x={560} y={206} k="Service" name="Billing" group="g-program" />
      <Node x={420} y={334} k="Datastore" name="Order snapshots" group="g-store" />
      <Node x={130} y={462} k="External" name="Customer DB" group="g-outside" />
      <Wires
        color="#1d4ed8"
        lines={[
          [280, 107, 280, 206],
          [280, 491, 280, 264],
          [430, 235, 420, 334],
          [710, 235, 630, 107],
        ]}
      />
      <aside className="ln-side">
        <p className="node-k">Wire</p>
        <h2>reads</h2>
        <div className="ln-field">customer row</div>
        <div className="ln-field">on request</div>
        <p>From Customer DB to Orders API. Release on a left port to draw another.</p>
      </aside>
      <div className="ln-foot">Orders API reads customer row from Customer DB on request.</div>
    </div>
  );
}

function IndexLanding() {
  return (
    <div className="screen look-index">
      <div className="ix-bar">
        <span className="ix-logo" />
        <strong>Fairlead</strong>
        <span className="ix-spacer" />
        <span className="ix-btn">New chart</span>
      </div>
      <div className="ix-table">
        <div className="ix-head">
          <span>Chart</span>
          <span>Cards</span>
          <span>Wires</span>
          <span />
        </div>
        <div className="ix-row">
          <strong>Orders snapshot</strong>
          <span>6</span>
          <span>5</span>
          <span>Open</span>
        </div>
      </div>
      <p className="ix-note">The chart describes systems, and it does not connect to them. Charts stay in this browser.</p>
    </div>
  );
}

function IndexEditor() {
  return (
    <div className="screen look-index">
      <div className="ix-editor">
        <div className="ix-bar">
          <span className="ix-logo" />
          <strong>Orders snapshot</strong>
          <span className="ix-ghost">Diagrams</span>
          <span className="ix-ghost">Download JSON</span>
          <span className="ix-ghost">Open JSON</span>
          <span className="ix-spacer" />
          <span className="ix-btn">Add card</span>
        </div>
        <div className="ix-outline">
          <div className="ix-group">Edge</div>
          <div className="ix-item">Checkout</div>
          <div className="ix-item">Invoices</div>
          <div className="ix-group">Program</div>
          <div className="ix-item is-on">
            Orders API
            <p className="ix-sentence">reads customer row from Customer DB</p>
          </div>
          <div className="ix-item">Billing</div>
          <div className="ix-group">Store</div>
          <div className="ix-item">Order snapshots</div>
          <div className="ix-group">Outside</div>
          <div className="ix-item">Customer DB</div>
        </div>
        <div className="ix-stage">
          <Node x={40} y={80} k="Edge" name="Checkout" />
          <Node x={40} y={220} k="Outside" name="Customer DB" />
          <Node x={250} y={140} k="Program" name="Orders API" on />
          <Node x={250} y={300} k="Program" name="Billing" />
          <Wires
            color="#0969da"
            lines={[
              [200, 109, 250, 169],
              [200, 249, 250, 185],
              [330, 198, 330, 300],
            ]}
          />
          <div className="zoom">
            <span>+</span>
            <span>−</span>
            <span>⊡</span>
          </div>
          <div className="map" />
        </div>
        <aside className="ix-inspector">
          <h2>Orders API</h2>
          <p className="ix-k">Service · orders team</p>
          <span className="ix-label">Name</span>
          <div className="ix-input">Orders API</div>
          <span className="ix-label">Summary</span>
          <div className="ix-input">Accepts the order and writes a snapshot.</div>
          <span className="ix-label">Owner</span>
          <div className="ix-input">orders team</div>
        </aside>
      </div>
    </div>
  );
}

function Lane({ label, add, children }: { label: string; add?: boolean; children?: ReactNode }) {
  return (
    <div className="lane">
      <div className="lane-label">
        <span>{label}</span>
        {add ? <button type="button">+</button> : <span />}
      </div>
      <div className="lane-row">{children}</div>
    </div>
  );
}

function Node({
  x,
  y,
  k,
  name,
  sub,
  on,
  group,
}: {
  x: number;
  y: number;
  k: string;
  name: string;
  sub?: string;
  on?: boolean;
  group?: string;
}) {
  return (
    <div className={on ? `node is-on ${group ?? ""}` : `node ${group ?? ""}`} style={{ left: x, top: y }}>
      <span className="node-k">{k}</span>
      <span className="node-n">{name}</span>
      {sub ? <span className="node-s">{sub}</span> : null}
    </div>
  );
}

function Wires({ color, lines }: { color: string; lines: [number, number, number, number][] }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className="wire-layer" viewBox="0 0 1120 640">
      <defs>
        <marker id={id} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" fill={color} />
        </marker>
      </defs>
      {lines.map((line) => (
        <line
          key={line.join("-")}
          x1={line[0]}
          y1={line[1]}
          x2={line[2]}
          y2={line[3]}
          stroke={color}
          strokeWidth="1.75"
          markerEnd={`url(#${id})`}
        />
      ))}
    </svg>
  );
}
