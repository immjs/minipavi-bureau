import { jsx as _jsx } from "react/jsx-runtime";
import { mirroringStore } from "./store.js";
export function Secondary({ sessionName }) {
    const currentMirror = sessionName && mirroringStore[sessionName];
    if (!currentMirror) {
        return _jsx("yjoin", { widthAlign: "middle", heightAlign: "middle", children: "No such mirroring session" });
    }
}
