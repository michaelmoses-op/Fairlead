import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useCharts } from "../state/charts";
import { Wordmark } from "./Wordmark";

const MOD = /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl";

export function TopBar() {
  const {
    diagram,
    diagrams,
    viewingSample,
    error,
    clearArmed,
    rename,
    newDiagram,
    duplicate,
    openDiagram,
    deleteDiagram,
    openSample,
    clearDiagram,
    download,
    importText,
    dismissError,
  } = useCharts();
  const [fileOpen, setFileOpen] = useState(false);
  const [diagramsOpen, setDiagramsOpen] = useState(false);
  const [shareNote, setShareNote] = useState(false);
  const [rowMenu, setRowMenu] = useState<{ id: string; name: string; top: number; left: number } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const fileMenuRef = useRef<HTMLDivElement>(null);
  const diagramsRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const rowMenuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fileMenuId = useId();
  const diagramsMenuId = useId();

  useEffect(() => {
    if (!fileOpen && !diagramsOpen && !shareNote && !rowMenu && !pendingDelete) return;
    function onPointer(event: MouseEvent) {
      const target = event.target as Node;
      if (pendingDelete) return;
      if (fileOpen && !fileMenuRef.current?.contains(target)) setFileOpen(false);
      if (diagramsOpen && !diagramsRef.current?.contains(target) && !rowMenuRef.current?.contains(target)) {
        setDiagramsOpen(false);
      }
      if (shareNote && !shareRef.current?.contains(target)) setShareNote(false);
      if (rowMenu && !rowMenuRef.current?.contains(target) && !diagramsRef.current?.contains(target)) {
        setRowMenu(null);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (pendingDelete) {
        setPendingDelete(null);
        return;
      }
      setFileOpen(false);
      setDiagramsOpen(false);
      setShareNote(false);
      setRowMenu(null);
    }
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [fileOpen, diagramsOpen, shareNote, rowMenu, pendingDelete]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      const mod = event.metaKey || event.ctrlKey;
      if (!mod || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (key === "s") {
        event.preventDefault();
        if (!typing) download();
        return;
      }
      if (typing) return;
      if (key === "n") {
        event.preventDefault();
        newDiagram();
      } else if (key === "d") {
        event.preventDefault();
        duplicate();
      } else if (key === "o") {
        event.preventDefault();
        fileRef.current?.click();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [download, newDiagram, duplicate]);

  function openFile() {
    setFileOpen(false);
    fileRef.current?.click();
  }

  return (
    <header className="topbar">
      <div className="top-lead">
        <Link to="/" className="brand" aria-label="Fairlead home">
          <Wordmark variant="bar" />
        </Link>
        <span className="top-slash" aria-hidden="true">
          /
        </span>
        <div className="name-wrap" ref={diagramsRef}>
          <input
            className="name-input"
            aria-label="Diagram name"
            value={diagram.name}
            spellCheck={false}
            onChange={(event) => rename(event.target.value)}
          />
          <button
            type="button"
            className="name-chevron"
            aria-label="Saved diagrams"
            aria-expanded={diagramsOpen}
            aria-controls={diagramsMenuId}
            onClick={() => {
              setDiagramsOpen((open) => !open);
              setFileOpen(false);
              setShareNote(false);
              setRowMenu(null);
            }}
          >
            <Chevron />
          </button>
          {diagramsOpen && (
            <div
              className="menu-pop menu-pop-start"
              id={diagramsMenuId}
              role="menu"
              onScroll={() => setRowMenu(null)}
            >
              {diagrams.length === 0 && <p className="menu-empty">No saved diagrams yet.</p>}
              {diagrams.map((item) => (
                <div key={item.id} className="menu-row">
                  <button
                    type="button"
                    role="menuitem"
                    className={
                      !viewingSample && item.id === diagram.id ? "menu-item menu-item-active" : "menu-item"
                    }
                    onClick={() => {
                      openDiagram(item.id);
                      setDiagramsOpen(false);
                      setRowMenu(null);
                    }}
                  >
                    {item.name}
                  </button>
                  <button
                    type="button"
                    className="menu-more"
                    aria-label={`Options for ${item.name}`}
                    aria-expanded={rowMenu?.id === item.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (rowMenu?.id === item.id) {
                        setRowMenu(null);
                        return;
                      }
                      const rect = event.currentTarget.getBoundingClientRect();
                      setRowMenu({
                        id: item.id,
                        name: item.name,
                        top: rect.bottom + 6,
                        left: Math.max(8, rect.right - 168),
                      });
                    }}
                  >
                    <Dots />
                  </button>
                </div>
              ))}
              <div className="menu-divider" />
              <button
                type="button"
                role="menuitem"
                className={viewingSample ? "menu-item menu-item-active" : "menu-item"}
                onClick={() => {
                  openSample();
                  setDiagramsOpen(false);
                }}
              >
                Orders snapshot
                <span className="menu-tag">Sample</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="top-actions">
        <p
          className={viewingSample ? "status status-sample" : "status"}
          title={
            viewingSample
              ? "This is the example. An edit saves a copy in this browser."
              : "Local chart. Nothing is connected to your cloud."
          }
        >
          <span className="status-dot" aria-hidden="true" />
          {viewingSample ? "Sample" : "Saved locally"}
        </p>
        <div className="menu" ref={fileMenuRef}>
          <button
            type="button"
            className="bar-btn file-btn"
            aria-expanded={fileOpen}
            aria-controls={fileMenuId}
            onClick={() => {
              setFileOpen((open) => !open);
              setDiagramsOpen(false);
              setShareNote(false);
              setRowMenu(null);
            }}
          >
            File
            <Chevron />
          </button>
          {fileOpen && (
            <div className="menu-pop menu-pop-file" id={fileMenuId} role="menu">
              <button type="button" role="menuitem" className="menu-item" onClick={() => { newDiagram(); setFileOpen(false); }}>
                <span className="menu-label">
                  <MenuIcon d="M12 5v14M5 12h14" />
                  New chart
                </span>
                <span className="menu-key">{MOD} N</span>
              </button>
              <button type="button" role="menuitem" className="menu-item" onClick={() => { duplicate(); setFileOpen(false); }}>
                <span className="menu-label">
                  <MenuIcon>
                    <rect x="9" y="9" width="11" height="11" rx="2" />
                    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                  </MenuIcon>
                  Duplicate
                </span>
                <span className="menu-key">{MOD} D</span>
              </button>
              <div className="menu-divider" />
              <button type="button" role="menuitem" className="menu-item" onClick={openFile}>
                <span className="menu-label">
                  <MenuIcon d="M12 16V5M7 9l5-5 5 5M5 20h14" />
                  Import JSON
                </span>
                <span className="menu-key">{MOD} O</span>
              </button>
              <button type="button" role="menuitem" className="menu-item" onClick={() => { download(); setFileOpen(false); }}>
                <span className="menu-label">
                  <MenuIcon d="M12 4v11M7 11l5 5 5-5M5 20h14" />
                  Download JSON
                </span>
                <span className="menu-key">{MOD} S</span>
              </button>
              <div className="menu-divider" />
              <button
                type="button"
                role="menuitem"
                className={clearArmed ? "menu-item menu-item-armed" : "menu-item menu-item-danger"}
                onClick={clearDiagram}
              >
                <span className="menu-label">
                  <MenuIcon d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" />
                  {clearArmed ? "Confirm clear" : "Clear chart"}
                </span>
              </button>
            </div>
          )}
        </div>
        <div className="menu" ref={shareRef}>
          <button
            type="button"
            className="bar-btn bar-btn-share"
            aria-expanded={shareNote}
            onClick={() => {
              setShareNote((open) => !open);
              setFileOpen(false);
              setDiagramsOpen(false);
              setRowMenu(null);
            }}
          >
            <MenuIcon>
              <circle cx="6" cy="12" r="2.5" />
              <circle cx="18" cy="6" r="2.5" />
              <circle cx="18" cy="18" r="2.5" />
              <path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" />
            </MenuIcon>
            Share
          </button>
          {shareNote && (
            <div className="menu-pop share-note" role="status">
              This feature is in development.
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          className="file-input"
          type="file"
          accept="application/json,.json"
          aria-label="Import a Fairlead JSON file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => importText(String(reader.result ?? ""));
            reader.onerror = () => importText("");
            reader.readAsText(file);
          }}
        />
      </div>
      {rowMenu && (
        <div
          ref={rowMenuRef}
          className="menu-pop chart-row-menu"
          role="menu"
          style={{ top: rowMenu.top, left: rowMenu.left }}
        >
          <button
            type="button"
            role="menuitem"
            className="menu-item menu-item-danger"
            onClick={() => {
              setPendingDelete({ id: rowMenu.id, name: rowMenu.name });
              setRowMenu(null);
              setDiagramsOpen(false);
            }}
          >
            <span className="menu-label">
              <MenuIcon d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" />
              Delete chart
            </span>
          </button>
        </div>
      )}
      {pendingDelete && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPendingDelete(null);
          }}
        >
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-chart-title">
            <h2 id="delete-chart-title">Delete this chart?</h2>
            <p>
              <strong>{pendingDelete.name}</strong> will be removed from this browser. This cannot be undone.
            </p>
            <div className="modal-actions">
              <button type="button" className="bar-btn" onClick={() => setPendingDelete(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="bar-btn bar-btn-danger"
                onClick={() => {
                  deleteDiagram(pendingDelete.id);
                  setPendingDelete(null);
                }}
              >
                Delete chart
              </button>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
          <button type="button" onClick={dismissError}>
            Dismiss
          </button>
        </div>
      )}
    </header>
  );
}

function Dots() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function MenuIcon({ d, children }: { d?: string; children?: ReactNode }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d ? <path d={d} /> : children}
    </svg>
  );
}
