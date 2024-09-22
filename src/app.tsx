import { MemoryRouter, Route, Routes } from "react-router";
import { Finder } from "./finder.js";
import { Edit } from "./edit.js";

export function App() {
  return (
    <MemoryRouter initialEntries={["/finder?path=/"]}>
      <Routes>
        <Route path="/finder" element={<Finder />} />
        <Route path="/edit" element={<Edit />} />
      </Routes>
    </MemoryRouter>
  );
}
