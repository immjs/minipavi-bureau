import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lstat, mkdir, readdir, writeFile } from "fs/promises";
import { useKeyboard } from "minitel-react";
import path, { join } from "path";
import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { windowContext } from "./app.js";
function FinderItem({ name, isLink, isDir, hasFocus, noBlink }) {
    const stuff = useRef(null);
    useEffect(() => {
        if (hasFocus) {
            stuff.current?.scrollIntoView();
        }
    }, [hasFocus]);
    return (_jsx("para", { ref: stuff, invert: hasFocus, noBlink: noBlink, children: `${name === '..' ? '^^^' : isLink ? '[>]' : isDir ? '[ ]' : ' * '} ${name === '..' ? 'Up a dir' : name}` }));
}
var FinderStates;
(function (FinderStates) {
    FinderStates[FinderStates["CREATING_FILE"] = 0] = "CREATING_FILE";
    FinderStates[FinderStates["CREATING_DIR"] = 1] = "CREATING_DIR";
    FinderStates[FinderStates["DEFAULT"] = 2] = "DEFAULT";
})(FinderStates || (FinderStates = {}));
export function Finder() {
    const setWindowName = useContext(windowContext).setWindowName;
    useEffect(() => setWindowName('Finder'), []);
    const [hasFocus, setHasFocus] = useState(false);
    const [focusedFile, setFocusedFile] = useState(0);
    const [currFiles, setCurrFiles] = useState([]);
    const [currPath, setCurrPath] = useState(null);
    // const [currPathTmp, setCurrPathTmp] = useState(currPath);
    const [appState, setAppState] = useState(FinderStates.DEFAULT);
    const navigate = useNavigate();
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
    const [isCreating, setIsCreating] = useState(false);
    const [newFilename, setNewFilename] = useState('');
    useKeyboard((v) => {
        if (!currPath)
            return;
        if (appState === FinderStates.CREATING_FILE) {
            switch (v) {
                case '\x13\x41':
                    if (newFilename === '') {
                        setAppState(FinderStates.DEFAULT);
                        return;
                    }
                    (async () => {
                        setIsCreating(true);
                        await writeFile(join(currPath, newFilename), '');
                        setNewFilename('');
                        setIsCreating(false);
                        setAppState(FinderStates.DEFAULT);
                    })();
                    break;
            }
            return;
        }
        if (appState === FinderStates.CREATING_DIR) {
            switch (v) {
                case '\x13\x41':
                    if (newFilename === '') {
                        setAppState(FinderStates.DEFAULT);
                        return;
                    }
                    (async () => {
                        setIsCreating(true);
                        await mkdir(join(currPath, newFilename));
                        setNewFilename('');
                        setIsCreating(false);
                        setAppState(FinderStates.DEFAULT);
                    })();
                    break;
            }
            return;
        }
        if (!hasFocus)
            return;
        switch (v) {
            case '\x1b[\x42': {
                setFocusedFile((focusedFile + 1) % currFiles.length);
                break;
            }
            case '\x1b[\x41': {
                setFocusedFile(((focusedFile - 1) % currFiles.length + currFiles.length) % currFiles.length);
                break;
            }
            case '\x0e': {
                setAppState(FinderStates.CREATING_FILE);
                break;
            }
            case '\x04': {
                setAppState(FinderStates.CREATING_DIR);
                break;
            }
            case '\x13\x41': {
                const newPath = join(currPath, currFiles[focusedFile].name);
                if (!currFiles[focusedFile].isDir && !currFiles[focusedFile].isLink) {
                    const fileext = path.extname(newPath);
                    switch (fileext.toLowerCase()) {
                        case '.msld':
                            return navigate(`/slides?path=${encodeURIComponent(newPath)}`);
                        case '.png':
                            return navigate(`/imgview?path=${encodeURIComponent(newPath)}`);
                    }
                    navigate(`/edit?path=${encodeURIComponent(newPath)}`);
                    break;
                }
                navigate(`/finder?path=${newPath}`, { replace: true });
                setCurrPath(newPath);
                break;
            }
            case '\r': {
                const newPath = join(currPath, currFiles[focusedFile].name);
                if (!currFiles[focusedFile].isDir && !currFiles[focusedFile].isLink) {
                    navigate(`/edit?path=${encodeURIComponent(newPath)}`);
                    break;
                }
                navigate(`/finder?path=${newPath}`, { replace: true });
                setCurrPath(newPath);
                break;
            }
        }
    });
    if (appState === FinderStates.CREATING_FILE) {
        return (_jsxs("yjoin", { widthAlign: "stretch", children: [_jsx("para", { bg: 7, fg: 0, textAlign: 'middle', pad: [0, 1], children: "Homepage" }), _jsx("yjoin", { flexGrow: true, widthAlign: "middle", heightAlign: "middle", pad: 2, bg: 4, children: _jsxs("yjoin", { widthAlign: "stretch", width: 24, gap: 1, disabled: isCreating, children: [_jsxs("yjoin", { children: [_jsx("xjoin", { widthAlign: "end", pad: 1, bg: 5, children: _jsx("para", { children: currPath }) }), _jsxs("yjoin", { widthAlign: "stretch", bg: 6, fg: 0, pad: 1, children: [_jsx("span", { children: "New file name" }), _jsx("input", { autofocus: true, onChange: (v) => setNewFilename(v) })] })] }), _jsxs("para", { pad: 1, bg: 5, textAlign: "middle", children: [_jsx("span", { invert: true, children: "[ENVOI]" }), " Create file"] })] }) })] }));
    }
    if (appState === FinderStates.CREATING_DIR) {
        return (_jsxs("yjoin", { widthAlign: "stretch", children: [_jsx("para", { bg: 7, fg: 0, textAlign: 'middle', pad: [0, 1], children: "Homepage" }), _jsx("yjoin", { flexGrow: true, widthAlign: "middle", heightAlign: "middle", pad: 2, bg: 4, children: _jsxs("yjoin", { widthAlign: "stretch", width: 24, gap: 1, disabled: isCreating, children: [_jsxs("yjoin", { children: [_jsx("xjoin", { widthAlign: "end", pad: 1, bg: 5, children: _jsx("para", { children: currPath }) }), _jsxs("yjoin", { widthAlign: "stretch", bg: 6, fg: 0, pad: 1, children: [_jsx("span", { children: "New directory name" }), _jsx("input", { autofocus: true, onChange: (v) => setNewFilename(v) })] })] }), _jsxs("para", { pad: 1, bg: 5, textAlign: "middle", children: [_jsx("span", { invert: true, children: "[ENVOI]" }), " Create dir"] })] }) })] }));
    }
    return (_jsxs("yjoin", { widthAlign: "stretch", children: [_jsx("para", { bg: 7, fg: 0, textAlign: 'middle', pad: [0, 1], children: "Homepage" }), _jsxs("yjoin", { flexGrow: true, pad: 2, gap: 0, bg: 4, children: [_jsx("para", { pad: 1, bg: 5, children: currPath }), _jsx("scroll", { pad: 1, flexGrow: true, bg: 6, fg: 0, children: _jsx("focus", { autofocus: true, onFocus: () => setHasFocus(true), onBlur: () => setHasFocus(false), children: _jsx("yjoin", { children: currFiles.map((v, i) => (_jsx(FinderItem, { name: v.name, isLink: v.isLink, isDir: v.isDir, hasFocus: i === focusedFile, noBlink: !(hasFocus && i === focusedFile) }, v.name))) }) }) })] })] }));
}
