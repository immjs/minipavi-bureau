import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useKeyboard } from "minitel-react";
import { useState } from "react";
import { apps } from "./apps.js";
import { useNavigate } from "react-router";
export function Homepage() {
    const [userInput, setUserInput] = useState('');
    const navigate = useNavigate();
    useKeyboard((v) => {
        if (v === '\x13\x41') {
            const app = apps.find((v) => v.name === userInput);
            if (!app)
                return;
            navigate(app.path);
        }
    });
    return (_jsxs("yjoin", { widthAlign: "stretch", children: [_jsx("para", { bg: 7, fg: 0, textAlign: 'middle', pad: [0, 1], children: "Homepage" }), _jsx("yjoin", { flexGrow: true, widthAlign: "middle", heightAlign: "middle", bg: 4, children: _jsxs("yjoin", { widthAlign: "stretch", width: 24, children: [_jsx("xjoin", { widthAlign: "middle", bg: 5, doubleWidth: true, doubleHeight: true, pad: 2, children: "MiniSys" }), _jsx("yjoin", { widthAlign: "stretch", bg: 6, fg: 0, pad: [1, 2], gap: 1, children: _jsxs("yjoin", { widthAlign: "stretch", children: [_jsx("span", { children: "Application:" }), _jsx("input", { autofocus: true, onChange: (v) => setUserInput(v) }), _jsx("scroll", { height: 3, children: _jsx("yjoin", { children: apps
                                                .filter((v) => v.name.startsWith(userInput))
                                                .map((v, i) => (_jsxs("para", { children: [v.name, "|", _jsx("span", { fg: 1, children: v.description })] }, v.name))) }) })] }) })] }) })] }));
}
