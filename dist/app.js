import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MemoryRouter, Route, Routes } from "react-router";
import { Finder } from "./finder.js";
import { Edit } from "./edit.js";
export function App() {
    return (_jsx(MemoryRouter, { initialEntries: ["/finder?path=/"], children: _jsxs(Routes, { children: [_jsx(Route, { path: "/finder", element: _jsx(Finder, {}) }), _jsx(Route, { path: "/edit", element: _jsx(Edit, {}) })] }) }));
}
