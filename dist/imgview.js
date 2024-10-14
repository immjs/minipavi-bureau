import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import sharp from "sharp";
async function sharpHandler(sharpInstance) {
    const { data, info } = await sharpInstance
        .raw()
        .ensureAlpha()
        .toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;
    const rgbArray = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * channels;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            row.push([r, g, b]);
        }
        rgbArray.push(row);
    }
    return rgbArray;
}
export function ImgViewApp() {
    const params = new URLSearchParams(useLocation().search);
    const [data, setData] = useState(null);
    useEffect(() => {
        setData(params.get('path'));
    }, []);
    if (!data)
        return _jsx("para", { children: "Loading..." });
    return _jsx(ImgView, { path: data });
}
function ImgView({ path }) {
    const [mosaicData, setMosaicData] = useState([[]]);
    useEffect(() => {
        (async () => {
            setMosaicData(await sharpHandler(sharp(path).resize(80, 72)));
        })();
    }, [path]);
    // console.log(mosaicData, path);
    return (_jsxs("yjoin", { flexGrow: true, widthAlign: "stretch", children: [_jsx("para", { bg: 7, fg: 0, textAlign: 'middle', pad: [0, 1], children: "Slides" }), _jsx("scroll", { overflowX: "auto", overflowY: "auto", children: _jsx("image", { imageData: mosaicData, flexGrow: true }) })] }));
}
