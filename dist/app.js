import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router";
import { Finder } from "./finder.js";
import { Edit } from "./edit.js";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useKeyboard } from "minitel-react";
import { Homepage } from "./homepage.js";
import { Term } from "./terminal.js";
import { Clock } from "./clock.js";
import { SlidesApp } from "./slides/slides.js";
import { ImgViewApp } from "./imgview.js";
export const windowContext = createContext(null);
function WindowInner() {
    const navigate = useNavigate();
    useKeyboard((v) => v === '\x13E' && navigate(-1));
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/finder", element: _jsx(Finder, {}) }), _jsx(Route, { path: "/edit", element: _jsx(Edit, {}) }), _jsx(Route, { path: "/clock", element: _jsx(Clock, {}) }), _jsx(Route, { path: "/slides", element: _jsx(SlidesApp, {}) }), _jsx(Route, { path: "/imgview", element: _jsx(ImgViewApp, {}) }), _jsx(Route, { path: "/term", element: _jsx(Term, {}) }), _jsx(Route, { path: "/", element: _jsx(Homepage, {}) })] }));
}
function Window({ name, id, setWindowing, ...props }) {
    function setWindowName(windowName) {
        setWindowing((windowing) => windowing.map((v) => ({ ...v, name: v.id === id ? windowName : v.name })));
    }
    if (!props.visible) {
        props.fillChar = '\x09';
    }
    return (_jsx("cont", { ...props, children: _jsx(windowContext.Provider, { value: { setWindowName }, children: _jsx(MemoryRouter, { initialEntries: ["/"], children: _jsx(WindowInner, {}) }) }) }));
}
export const windowingContext = createContext(null);
var WindowStates;
(function (WindowStates) {
    WindowStates[WindowStates["VIEWING_CURRENT_WINDOW"] = 0] = "VIEWING_CURRENT_WINDOW";
    WindowStates[WindowStates["SWITCHING_WINDOWS"] = 1] = "SWITCHING_WINDOWS";
})(WindowStates || (WindowStates = {}));
function WindowItems({ setWmState }) {
    const [windowing, setWindowing] = useContext(windowingContext);
    const [subfocusAt, setSubfocusAt] = useState(windowing.findIndex((v) => v.visible));
    const [hasFocus, setHasFocus] = useState(false);
    useKeyboard((v) => {
        if (hasFocus) {
            switch (v) {
                case '\x1b[\x42': {
                    const newSubfocusAt = Math.min(subfocusAt + 1, (windowing.length - 1) + 1);
                    setSubfocusAt(newSubfocusAt);
                    setWindowing((windowing) => {
                        windowing.forEach((v) => { v.visible = false; });
                        if (newSubfocusAt in windowing)
                            windowing[newSubfocusAt].visible = true;
                        return [...windowing];
                    });
                    break;
                }
                case '\x1b[\x41': {
                    const newSubfocusAt = Math.max(subfocusAt - 1, 0);
                    setSubfocusAt(newSubfocusAt);
                    setWindowing((windowing) => {
                        windowing.forEach((v) => { v.visible = false; });
                        if (newSubfocusAt in windowing)
                            windowing[newSubfocusAt].visible = true;
                        return [...windowing];
                    });
                    break;
                }
                case '\x13\x41': {
                    setWindowing((windowing) => {
                        windowing.forEach((v) => { v.visible = false; });
                        if (subfocusAt === windowing.length) {
                            windowing.push({ id: Date.now(), name: 'New Window', visible: true });
                        }
                        else {
                            windowing[subfocusAt].visible = true;
                        }
                        return [...windowing];
                    });
                    setWmState(WindowStates.VIEWING_CURRENT_WINDOW);
                    break;
                }
                case '\x13\x47': {
                    if (windowing.length < 1)
                        break;
                    setWindowing((windowing) => windowing.filter((_, i) => i !== subfocusAt));
                    break;
                }
            }
        }
    }, [hasFocus, windowing, subfocusAt]);
    return (_jsx("scroll", { overflowX: "hidden", overflowY: "scroll", height: 3, children: _jsx("focus", { autofocus: true, onFocus: () => setHasFocus(true), onBlur: () => setHasFocus(false), children: _jsxs("yjoin", { widthAlign: "stretch", invert: false, children: [windowing.map((v, i) => _jsx(WindowItem, { name: v.name, hasFocus: subfocusAt === i }, i)), _jsx(WindowItem, { name: "New window", hasFocus: subfocusAt === windowing.length })] }) }) }));
}
function WindowItem({ name, hasFocus }) {
    const paraRef = useRef(null);
    useEffect(() => {
        if (hasFocus)
            paraRef.current?.scrollIntoView();
    }, [hasFocus]);
    return (_jsx("para", { invert: hasFocus, ref: paraRef, children: name }));
}
export function App() {
    const [windowing, setWindowing] = useState([
        {
            id: Date.now(),
            name: '/',
            visible: true,
        },
    ]);
    const [wmState, setWmState] = useState(WindowStates.VIEWING_CURRENT_WINDOW);
    useKeyboard((v) => {
        switch (v) {
            case '\x13D': {
                if (wmState === WindowStates.SWITCHING_WINDOWS)
                    setWmState(WindowStates.VIEWING_CURRENT_WINDOW);
                else
                    setWmState(WindowStates.SWITCHING_WINDOWS);
                break;
            }
        }
    }, [wmState]);
    const selectedWindow = windowing.findIndex((v) => v.visible);
    const selectedWinWithNewWin = selectedWindow === -1 ? windowing.length + 1 : selectedWindow + 1;
    return (_jsx("zjoin", { children: _jsxs(windowingContext.Provider, { value: [windowing, setWindowing], children: [windowing.map((v, i) => (_jsx(Window, { setWindowing: setWindowing, name: v.name, id: v.id, disabled: !v.visible || wmState === WindowStates.SWITCHING_WINDOWS, visible: v.visible }, v.id))), _jsxs("para", { invert: true, fillChar: '\x09', children: [" ", selectedWinWithNewWin, "/", windowing.length, " "] }), wmState === WindowStates.SWITCHING_WINDOWS
                    && (_jsx("xjoin", { widthAlign: "middle", heightAlign: "middle", fillChar: '\x09', children: _jsx("cont", { pad: 1, fillChar: " ", bg: 0, children: _jsxs("yjoin", { flexGrow: true, pad: 2, widthAlign: "stretch", bg: 4, gap: 1, children: [_jsx("para", { children: "Window switching" }), _jsx(WindowItems, { setWmState: setWmState })] }) }) }))] }) }));
}
