import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LookEditor, LookLanding, type Look } from "./screens";
import "./board.css";

const LOOKS: { id: Look; index: string; name: string; line: string }[] = [
  {
    id: "blueprint",
    index: "01",
    name: "Blueprint",
    line: "An engineering sheet. You open the chart as the page, add cards from a tool row, and edit the selected wire in a table along the bottom. Cyan rules on a deep blue grid.",
  },
  {
    id: "phosphor",
    index: "02",
    name: "Phosphor",
    line: "A session log. The landing page is the written trace. In the editor the sentences fill the lower half, and verb, payload, and rhythm edit on the selected line. Green mono on black.",
  },
  {
    id: "poster",
    index: "03",
    name: "Poster",
    line: "The sentence is the page. The diagram sits in the margin of the line you are reading. In the editor the trace stays on the left, and the inspector opens over the canvas. Black type, one red wire, white ground.",
  },
  {
    id: "lanes",
    index: "04",
    name: "Lanes",
    line: "Four bands — Edge, Program, Store, Outside — on the landing page and in the editor. A band header adds a card. The inspector stays on the right, and the sentence sits under the map. Cool gray, white cards, blue wires.",
  },
  {
    id: "index",
    index: "05",
    name: "Index",
    line: "A list of charts, then a list of the cards on the open chart. The sentence hangs under the selected card. Add card, import, and export live in the top bar. Light product UI, blue selection.",
  },
];

const WIDTH = 1120;
const HEIGHT = 640;

function isLook(value: string | null): value is Look {
  return LOOKS.some((look) => look.id === value);
}

export function StyleBoard() {
  const [params] = useSearchParams();
  const shot = params.get("shot");
  const look = isLook(shot) ? shot : null;

  useEffect(() => {
    const previous = document.body.style.background;
    document.body.style.background = look ? "#14161a" : "#121417";
    document.title = look ? `Fairlead — ${LOOKS.find((item) => item.id === look)?.name}` : "Fairlead looks";
    return () => {
      document.body.style.background = previous;
    };
  }, [look]);

  if (look) {
    return (
      <div className="pair">
        <p className="pair-label">{LOOKS.find((item) => item.id === look)?.name} · Landing</p>
        <LookLanding look={look} />
        <p className="pair-label">Editor</p>
        <LookEditor look={look} />
      </div>
    );
  }

  return (
    <div className="studio">
      <header className="studio-bar">
        <span className="studio-name">Five looks</span>
        <Link to="/">Current app</Link>
        <nav className="studio-nav">
          {LOOKS.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.name}
            </a>
          ))}
        </nav>
      </header>
      <div className="studio-intro">
        <h1>Same chart, five different screens.</h1>
        <p>
          Each pair is the landing page and the editor for one look. Cards, one-way wires, and the sentences stay.
          Pan, zoom, connect, the orders example, and JSON import and export stay with them. These pictures are the
          options. The working app is unchanged until you pick one.
        </p>
      </div>
      {LOOKS.map((item) => (
        <section key={item.id} id={item.id} className="option">
          <p className="option-kicker">{item.index}</p>
          <h2>{item.name}</h2>
          <p className="option-line">{item.line}</p>
          <Frame label="Landing">
            <LookLanding look={item.id} />
          </Frame>
          <Frame label="Editor">
            <LookEditor look={item.id} />
          </Frame>
        </section>
      ))}
    </div>
  );
}

function Frame({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setScale(Math.min(1, node.clientWidth / WIDTH));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <figure className="frame">
      <figcaption>{label}</figcaption>
      <div ref={ref} className="frame-window" style={{ height: HEIGHT * scale }}>
        <div className="frame-canvas" style={{ width: WIDTH, height: HEIGHT, transform: `scale(${scale})` }}>
          {children}
        </div>
      </div>
    </figure>
  );
}
