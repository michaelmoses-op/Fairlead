import { BrowserRouter, Route, Routes } from "react-router-dom";
import { StyleBoard } from "./preview/StyleBoard";
import { Editor } from "./screens/Editor";
import { Landing } from "./screens/Landing";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/styles" element={<StyleBoard />} />
      </Routes>
    </BrowserRouter>
  );
}
