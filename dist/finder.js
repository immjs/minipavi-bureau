import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lstat, readdir } from "fs/promises";
import { useKeyboard } from "minitel-react";
import { join } from "path";
import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router";
function FinderItem({ name, isLink, isDir, hasFocus }) {
    const stuff = useRef(null);
    useEffect(() => {
        if (hasFocus) {
            stuff.current?.scrollIntoView();
        }
    }, [hasFocus]);
    return (_jsx("para", { ref: stuff, invert: hasFocus, children: `${name === '..' ? '^^^' : isLink ? '[>]' : isDir ? '[ ]' : ' * '} ${name === '..' ? 'Up a dir' : name}` }));
}
export function Finder() {
    // return <para>AAAA</para>;
    const [hasFocus, setHasFocus] = useState(false);
    const [focusedFile, setFocusedFile] = useState(0);
    const [currFiles, setCurrFiles] = useState([]);
    const [currPath, setCurrPath] = useState(null);
    // const [currPathTmp, setCurrPathTmp] = useState(currPath);
    const [redirectTo, setRedirectTo] = useState(null);
    const params = new URLSearchParams(useLocation().search);
    useEffect(() => {
        if (!currPath)
            setCurrPath(params.get('path') || process.cwd());
    });
    useEffect(() => {
        // setCurrPathTmp(currPath);
        if (currPath) {
            readdir(currPath)
                .then(async (filenames) => {
                setCurrFiles([
                    ...(currPath === '/' ? [] : [{ name: '..', isDir: true, isLink: false }]),
                    ...(await Promise.all(filenames.map((filename, i) => lstat(join(currPath, filename))
                        .then((stats) => ({
                        name: filename,
                        isLink: stats.isSymbolicLink(),
                        isDir: stats.isDirectory(),
                    }))))),
                ]);
                setFocusedFile(0);
            });
        }
    }, [currPath]);
    useKeyboard((v) => {
        if (!currPath)
            return;
        switch (hasFocus && v) {
            case '\x1b[\x42': {
                setFocusedFile(Math.min(focusedFile + 1, currFiles.length - 1));
                break;
            }
            case '\x1b[\x41': {
                setFocusedFile(Math.max(focusedFile - 1, 0));
                break;
            }
            case '\x13\x41': {
                const newPath = join(currPath, currFiles[focusedFile].name);
                if (!currFiles[focusedFile].isDir && !currFiles[focusedFile].isLink) {
                    setRedirectTo(`/edit?path=${encodeURIComponent(newPath)}`);
                    break;
                }
                setCurrPath(newPath);
                break;
            }
        }
    });
    if (redirectTo)
        return _jsx(Navigate, { to: redirectTo });
    return (_jsxs("yjoin", { widthAlign: "stretch", children: [_jsx("para", { bg: 7, fg: 0, textAlign: 'middle', pad: [0, 1], children: "Homepage" }), _jsxs("yjoin", { flexGrow: true, pad: 2, gap: 0, bg: 4, children: [_jsx("para", { pad: 1, bg: 5, children: currPath }), _jsx("scroll", { pad: 1, flexGrow: true, bg: 6, fg: 0, children: _jsx("focus", { autofocus: true, onFocus: () => setHasFocus(true), onBlur: () => setHasFocus(false), children: _jsx("yjoin", { children: currFiles.map((v, i) => (_jsx(FinderItem, { name: v.name, isLink: v.isLink, isDir: v.isDir, hasFocus: i === focusedFile }, v.name))) }) }) })] })] }));
}
