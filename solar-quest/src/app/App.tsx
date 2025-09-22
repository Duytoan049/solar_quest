import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainMenu from "../features/menu/MainMenu";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        {/* <Route path="/planet/:id" element={<PlanetInfoPanel />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
