import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { common, createLowlight } from 'lowlight';
import { useEffect, useRef, useState } from 'react';
import sheets from './lowlight.js';
import { useLocation, useNavigate } from 'react-router';
import { createId } from '@paralleldrive/cuid2';
import { readFile, writeFile } from 'fs/promises';
import { useKeyboard } from 'minitel-react';
const lowlight = createLowlight(common);
export function Visit({ code, sheet }) {
    const newChildren = [];
    if (!('children' in code)) {
        if ('value' in code) {
            return code.value;
        }
        return '<!DOCTYPE html>';
    }
    const classes = code.type === 'element' ? code.properties.className : [];
    const styleClass = classes.find((v) => v in sheet);
    let scoped = {
        ...sheet,
    };
    for (let className in classes) {
        if (`${className}'s children` in sheet) {
            const v = sheet[`${className}'s children`];
            if (typeof v !== 'object')
                throw new Error('Malformed sheet');
            scoped = {
                ...scoped,
                ...v,
            };
        }
    }
    // Thannks https://github.com/wooorm/emphasize/blob/main/lib/index.js
    for (let childIdx in code.children) {
        const child = code.children[childIdx];
        newChildren.push(_jsx(Visit, { code: child, sheet: scoped }, childIdx));
    }
    if (styleClass) {
        const style = sheet[styleClass];
        if (typeof style !== 'number')
            throw new Error('Malformed sheet');
        return (_jsx("span", { fg: style, children: newChildren }));
    }
    else {
        return _jsx(_Fragment, { children: newChildren });
    }
}
function Editor({ path }) {
    const [textPad, setTextPad] = useState([0, 0, 0, 0]);
    const [linesPad, setLinesPad] = useState([0, 0, 0, 0]);
    const actualTextRef = useRef(null);
    const linesRef = useRef(null);
    const inputRef = useRef(null);
    // console.log('aaa');
    const [fileContents, setFileContents] = useState('');
    useEffect(() => {
        readFile(path, 'utf8')
            .then((v) => {
            setFileContents(v);
            if (inputRef.current)
                inputRef.current.value = v;
        });
    }, [path]);
    const navigate = useNavigate();
    useKeyboard((v) => {
        if (v === '\x13\x41') {
            if (inputRef.current)
                inputRef.current.focused = false;
            if (inputRef.current)
                inputRef.current.attributes.disabled = true;
            writeFile(path, fileContents)
                .then(() => navigate(-1));
        }
    });
    // Returns a highlighted HTML string
    const html = lowlight.highlightAuto(fileContents);
    const theme = 'dark';
    return (_jsxs("xjoin", { flexGrow: true, children: [_jsx("para", { width: 3, textAlign: "end", invert: true, ref: linesRef, pad: linesPad, children: Array.from({ length: fileContents.split('\n').length }, (_, i) => `${i}`).join('\n') }), _jsxs("zjoin", { flexGrow: true, children: [_jsx("input", { ref: inputRef, autofocus: true, multiline: true, onChange: setFileContents, onScroll: (scroll) => {
                            setTextPad(actualTextRef.current.attributes.pad = [-scroll[0], 0, 0, -scroll[1]]);
                            setLinesPad(linesRef.current.attributes.pad = [-scroll[0], 0, 0, 0]);
                        } }), _jsx("cont", { fillChar: ".", children: _jsx("para", { ref: actualTextRef, pad: textPad, children: fileContents }) }), _jsx("cont", { fillChar: "\x09", children: _jsx("para", { ref: actualTextRef, pad: textPad, children: _jsx(Visit, { code: html, sheet: sheets[theme] }) }) })] })] }));
}
export function Edit() {
    const params = new URLSearchParams(useLocation().search);
    const [path, setPath] = useState(null);
    useEffect(() => {
        setPath(params.get('path') || `/tmp/miniedit-${createId()}`);
    }, []);
    if (!path)
        return _jsx("para", { children: "Loading..." });
    return _jsx(Editor, { path: path });
}
