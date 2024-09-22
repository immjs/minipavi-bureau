import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lstat, readdir } from "fs/promises";
import { useKeyboard } from "minitel-react";
import { join } from "path";
import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router";
function FinderItem({ name, isLink, isDir, hasFocus }) {
    const stuff = useRef(null);
    useEffect(() => {
        if (hasFocus) {
            stuff.current?.scrollIntoView();
            console.log((stuff.current?.children[0]).text);
        }
    }, [hasFocus]);
    return (_jsx("para", { ref: stuff, invert: hasFocus, children: `${name === '..' ? '^^^' : isLink ? '[>]' : isDir ? '[ ]' : ' * '} ${name === '..' ? 'Up a dir' : name}` }));
}
export function Finder() {
    // return <para>AAAA</para>;
    const [hasFocus, setHasFocus] = useState(false);
    const [focusedFile, setFocusedFile] = useState(0);
    const [currFiles, setCurrFiles] = useState([]);
    const [currPath, setCurrPath] = useState(process.cwd());
    // const [currPathTmp, setCurrPathTmp] = useState(currPath);
    const [redirectTo, setRedirectTo] = useState(null);
    useEffect(() => {
        // setCurrPathTmp(currPath);
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
    }, [currPath]);
    useKeyboard((v) => {
        console.log(hasFocus, JSON.stringify(v));
        switch (hasFocus && v) {
            case '\x1b[\x42': {
                console.log(Math.min(focusedFile + 1, currFiles.length - 1), '+1');
                setFocusedFile(Math.min(focusedFile + 1, currFiles.length - 1));
                break;
            }
            case '\x1b[\x41': {
                console.log(Math.max(focusedFile - 1, 0), '-1');
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
    return (_jsxs("yjoin", { pad: [0, 2], gap: 1, children: [_jsx("para", { children: currPath }), _jsx("scroll", { flexGrow: true, children: _jsx("focus", { autofocus: true, onFocus: () => setHasFocus(true), onBlur: () => setHasFocus(false), children: _jsx("yjoin", { children: currFiles.map((v, i) => (_jsx(FinderItem, { name: v.name, isLink: v.isLink, isDir: v.isDir, hasFocus: i === focusedFile }, v.name))) }) }) })] }));
}
