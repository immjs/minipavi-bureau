import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useEffect, useState } from "react";
import { mirroringStore } from "./store.js";
import { minitelContext, useKeyboard } from "minitel-react";
import { init } from "@paralleldrive/cuid2";
export function MirrorApp() {
    const [mirrorToken, setMirrorToken] = useState(null);
    const minitel = useContext(minitelContext);
    useEffect(() => {
        if (mirrorToken) {
            mirroringStore[mirrorToken] = minitel;
            return function unmount() {
                const striem = mirroringStore[mirrorToken].stream;
                striem.mapping[mirrorToken].forEach((v) => {
                    striem.writablesOut.delete(v);
                });
                delete striem.mapping[mirrorToken];
            };
        }
    }, [mirrorToken]);
    useKeyboard((v) => {
        switch (v) {
            case '\x13\x41':
                if (!mirrorToken)
                    setMirrorToken(init({ length: 8 })());
        }
    });
    return (_jsxs("yjoin", { widthAlign: "stretch", children: [_jsx("para", { bg: 7, fg: 0, textAlign: 'middle', pad: [0, 1], children: "Mirror" }), _jsx("yjoin", { flexGrow: true, heightAlign: "middle", widthAlign: 'stretch', gap: 1, pad: [1, 2], bg: 4, children: _jsx("yjoin", { widthAlign: "stretch", bg: 6, fg: 0, pad: [1, 2], gap: 1, children: _jsx("yjoin", { widthAlign: "stretch", children: mirrorToken ? `Your mirror token is ${mirrorToken}\n[ENVOI] to interrupt` : `[ENVOI] to create a mirroring session` }) }) })] }));
}
