import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { readFile } from "fs/promises";
import { Parser } from "html-to-react";
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { windowContext } from "./app.js";
function Slides({ path, ...props }) {
    const [slides, setSlides] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    useEffect(() => {
        (async () => {
            const fileContents = await readFile(path, 'utf8');
            setSlides(Parser().parse(fileContents));
        })();
    }, [path]);
    useEffect(() => {
        if (currentSlide >= slides.length)
            setCurrentSlide(slides.length - 1);
        else if (currentSlide < 0 && slides.length !== 0)
            setCurrentSlide(0);
    }, [slides, currentSlide]);
    if (currentSlide === -1) {
        return _jsx("yjoin", { ...props, flexGrow: true, widthAlign: "middle", heightAlign: "middle", children: "No slides :'(" });
    }
    console.log(slides[currentSlide]);
    return slides[currentSlide];
}
export function SlidesApp() {
    const setWindowName = useContext(windowContext).setWindowName;
    useEffect(() => setWindowName('Slides'), []);
    const params = new URLSearchParams(useLocation().search);
    const [path, setPath] = useState(null);
    useEffect(() => {
        setPath(params.get('path'));
    }, []);
    if (!path)
        return _jsx("para", { children: "Loading..." });
    return (_jsxs("yjoin", { flexGrow: true, widthAlign: "stretch", children: [_jsx("para", { bg: 7, fg: 0, textAlign: 'middle', pad: [0, 1], children: "Slides" }), _jsx(Slides, { path: path, flexGrow: true })] }));
}
