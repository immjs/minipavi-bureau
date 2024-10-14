import { readFile } from "fs/promises";
import { Parser } from "html-to-react";
import { MinitelObjectAttributes } from "minitel-standalone/dist/types.js";
import { ReactNode, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { windowContext } from "../app.js";
import { manualTamper } from "./hack.js";
import { useKeyboard } from "minitel-react";

function Slides({ path, ...props }: { path: string } & Partial<MinitelObjectAttributes>) {
  const [slides, setSlides] = useState<ReactNode[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    (async () => {
      const fileContents = await readFile(path, 'utf8');
      setSlides((manualTamper(Parser().parse(fileContents)) as ReactNode[]).filter((v) => v));
    })();
  }, [path]);

  useEffect(() => {
    if (currentSlide >= slides.length) setCurrentSlide(slides.length - 1);
    else if (currentSlide < 0 && slides.length !== 0) setCurrentSlide(0);
  }, [slides, currentSlide]);
  
  // console.log(currentSlide, slides);
  
  useKeyboard((v) => {
    // console.log(JSON.stringify(v));
    switch (v) {
      case '\x1b[C': {
        setCurrentSlide((currentSlide) => currentSlide + 1);
        break;
      }
      case '\x1b[D': {
        setCurrentSlide((currentSlide) => currentSlide - 1);
        break;
      }
    }
  });

  if (currentSlide === -1) {
    return null;
  }

  return slides[currentSlide];
}

export function SlidesApp() {
  const setWindowName = useContext(windowContext).setWindowName;
  useEffect(() => setWindowName('Slides'), []);

  const params = new URLSearchParams(useLocation().search);
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    setPath(params.get('path'));
  }, []);

  if (!path) return <para>Loading...</para>

  return (
    <yjoin flexGrow widthAlign="stretch">
      <para bg={7} fg={0} textAlign='middle' pad={[0, 1]}>Slides</para>
      <Slides path={path} flexGrow />
    </yjoin>
  );
}

// export function SlidesApp() {
//   return (
//     <yjoin flexGrow widthAlign="stretch">
//       <para bg={7} fg={0} textAlign='middle' pad={[0, 1]}>Slides</para>
//       <yjoin
//         flexGrow={true}
//         widthAlign="middle"
//         heightAlign="middle"
//         bg={4}
//         wrap="word-wrap"
//       >
//         <yjoin
//           widthAlign="stretch"
//           gap={0}
//           textAlign="middle"
//           width={26}
//         >
//           <para
//             bg={6}
//             fg={0}
//             pad={1}
//           >
//             Can a web-like environment be brought to the Minitel?
//           </para>
//           <para bg={5} pad={1}>
//             Brought to you by
//       Juliet WANG (she/her)
//           </para>
//         </yjoin>
//       </yjoin>
//     </yjoin>
//   );
// }
