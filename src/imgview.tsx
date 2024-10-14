import { readFile } from "fs/promises";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import sharp, { Sharp } from "sharp";

type ColorTriplet = [number, number, number];
async function sharpHandler(sharpInstance: Sharp): Promise<ColorTriplet[][]> {
  const { data, info } = await sharpInstance
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const rgbArray: ColorTriplet[][] = [];

  for (let y = 0; y < height; y++) {
    const row: ColorTriplet[] = [];
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
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    setData(params.get('path'));
  }, []);

  if (!data) return <para>Loading...</para>

  return <ImgView path={data} />;
}

function ImgView({ path }: { path: string }) {
  const [mosaicData, setMosaicData] = useState<ColorTriplet[][]>([[]]);
  
  useEffect(() => {
    (async () => {
      setMosaicData(await sharpHandler(sharp(path).resize(80, 72)));
    })();
  }, [path]);

  return (
    <yjoin flexGrow widthAlign="stretch">
      <para bg={7} fg={0} textAlign='middle' pad={[0, 1]}>Slides</para>
      <scroll overflowX="auto" overflowY="auto">
        <image imageData={mosaicData} flexGrow />
      </scroll>
    </yjoin>
  );
}
