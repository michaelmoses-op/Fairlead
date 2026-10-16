import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Editor } from "./screens/Editor";
import { Landing } from "./screens/Landing";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  );
}
