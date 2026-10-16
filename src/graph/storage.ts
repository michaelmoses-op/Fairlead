import { loadDocument } from "./document";
import type { FairleadFile } from "./types";
import { DOCUMENT_VERSION } from "./types";

export const STORAGE_KEY = "fairlead.v1";

export function readStoredFile(): FairleadFile | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const result = loadDocument(raw);
    return result.ok ? result.file : null;
  } catch {
    return null;
  }
}

export function writeStoredFile(file: FairleadFile): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: DOCUMENT_VERSION,
        activeId: file.activeId,
        diagrams: file.diagrams,
      }),
    );
  } catch {
    // Private mode and full disks leave the chart on screen.
  }
}
