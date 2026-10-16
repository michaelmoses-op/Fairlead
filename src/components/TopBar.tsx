import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCharts } from "../state/charts";
import { Wordmark } from "./Wordmark";

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
    openSample,
    clearDiagram,
    download,
    importText,
    dismissError,
  } = useCharts();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    function onPointer(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="topbar">
      <Link to="/" className="brand" aria-label="Fairlead home">
        <Wordmark tone="ink" />
      </Link>
      <input
        className="name-input"
        aria-label="Diagram name"
        value={diagram.name}
        spellCheck={false}
        onChange={(event) => rename(event.target.value)}
      />
      <p className="status">Local chart. Nothing is connected to your cloud.</p>
      <div className="top-actions">
        <div className="menu" ref={menuRef}>
          <button
            type="button"
            className="bar-btn"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            Diagrams
          </button>
          {menuOpen && (
            <div className="menu-pop" id={menuId} role="menu">
              {diagrams.length === 0 && <p className="menu-empty">No saved diagrams yet.</p>}
              {diagrams.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  className={
                    !viewingSample && item.id === diagram.id ? "menu-item menu-item-active" : "menu-item"
                  }
                  onClick={() => {
                    openDiagram(item.id);
                    setMenuOpen(false);
                  }}
                >
                  {item.name}
                </button>
              ))}
              <div className="menu-divider" />
              <button
                type="button"
                role="menuitem"
                className={viewingSample ? "menu-item menu-item-active" : "menu-item"}
                onClick={() => {
                  openSample();
                  setMenuOpen(false);
                }}
              >
                Orders snapshot
                <span className="menu-tag">Sample</span>
              </button>
            </div>
          )}
        </div>
        <button type="button" className="bar-btn" onClick={newDiagram}>
          New
        </button>
        <button type="button" className="bar-btn" onClick={duplicate}>
          Duplicate
        </button>
        <button type="button" className={clearArmed ? "bar-btn bar-btn-armed" : "bar-btn"} onClick={clearDiagram}>
          {clearArmed ? "Confirm clear" : "Clear"}
        </button>
        <button type="button" className="bar-btn" onClick={download}>
          Download JSON
        </button>
        <button type="button" className="bar-btn" onClick={() => fileRef.current?.click()}>
          Open JSON
        </button>
        <input
          ref={fileRef}
          className="file-input"
          type="file"
          accept="application/json,.json"
          aria-label="Open a Fairlead JSON file"
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
