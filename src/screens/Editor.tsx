import { ReactFlowProvider } from "@xyflow/react";
import { ChartsProvider } from "../state/charts";
import { FlowCanvas } from "../components/FlowCanvas";
import { Inspector } from "../components/Inspector";
import { Palette } from "../components/Palette";
import { TopBar } from "../components/TopBar";
import { TracePanel } from "../components/TracePanel";

export function Editor() {
  return (
    <ChartsProvider>
      <ReactFlowProvider>
        <div className="editor-shell">
          <TopBar />
          <Palette />
          <FlowCanvas />
          <TracePanel />
          <Inspector />
        </div>
      </ReactFlowProvider>
    </ChartsProvider>
  );
}
