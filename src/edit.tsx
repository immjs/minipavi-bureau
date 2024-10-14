import { common, createLowlight } from 'lowlight';
import { useContext, useEffect, useRef, useState } from 'react';
import type { FullPadding } from 'minitel-standalone/dist/types.js';
import { Input, Paragraph } from 'minitel-standalone';

import { Root, Element as HastElement, Text as HastText, Comment as HastComment, Doctype as HastDoctype } from 'hast';

import sheets from './lowlight.js';
import { useLocation, useNavigate } from 'react-router';
import { createId } from '@paralleldrive/cuid2';
import { readFile, writeFile } from 'fs/promises';
import { useKeyboard } from 'minitel-react';
import { windowContext } from './app.js';

const lowlight = createLowlight(common);

interface Scoped {
  [k: string]: number | Scoped;
}

export function Visit({ code, sheet }: { code: (HastElement | HastText | HastComment | Root | HastDoctype), sheet: Scoped }) {
  const newChildren = [];

  if (!('children' in code)) {
    if ('value' in code) {
      return code.value;
    }
    return '<!DOCTYPE html>';
  }

  const classes = code.type === 'element' ? code.properties.className as string[] : [];
  const styleClass = classes.find((v) => v in sheet);
  let scoped = {
    ...sheet,
  };
  for (let className in classes) {
    if (`${className}'s children` in sheet) {
      const v = sheet[`${className}'s children`];
      if (typeof v !== 'object') throw new Error('Malformed sheet');
      scoped = {
        ...scoped,
        ...v,
      }
    }
  }
  // Thannks https://github.com/wooorm/emphasize/blob/main/lib/index.js

  for (let childIdx in code.children) {
    const child = code.children[childIdx];
    newChildren.push(<Visit code={child} sheet={scoped} key={childIdx} />);
  }

  if (styleClass) {
    const style = sheet[styleClass];
    if (typeof style !== 'number') throw new Error('Malformed sheet');
    return (
      <span fg={style}>
        {newChildren}
      </span>
    );
  } else {
    return <>{ newChildren }</>
  }
}

function Editor({ path }: { path: string }) {
  const setWindowName = useContext(windowContext).setWindowName;
  useEffect(() => setWindowName('Edit'), []);

  const [textPad, setTextPad] = useState<FullPadding>([0, 0, 0, 0]);
  const [linesPad, setLinesPad] = useState<FullPadding>([0, 0, 0, 0]);
  const actualTextRef = useRef<Paragraph>(null);
  const linesRef = useRef<Paragraph>(null);
  const inputRef = useRef<Input>(null);
  // console.log('aaa');

  const [fileContents, setFileContents] = useState('');
  const [isNewFile, setIsNewFile] = useState(false);

  useEffect(() => {
    readFile(path, 'utf8')
      .then((v) => {
        setFileContents(v);
        if (inputRef.current) inputRef.current.value = v;
      })
      .catch((err) => {
        // probably enoent
        setIsNewFile(true);
      });
  }, [path]);

  const navigate = useNavigate();

  useKeyboard((v) => {
    if (v === '\x13\x41') {
      if (inputRef.current) inputRef.current.focused = false;
      if (inputRef.current) inputRef.current.attributes.disabled = true;

      writeFile(path, fileContents)
        .then(() => navigate(-1));
    }
  });

  // Returns a highlighted HTML string
  const html = lowlight.highlightAuto(fileContents);
  
  const theme = 'dark';

  return (
    <yjoin widthAlign="stretch">
      <para bg={7} fg={0} textAlign='middle' pad={[0, 1]}>Text editor{isNewFile ? ' (New file)' : ''}</para>
      <cont flexGrow pad={[1, 2]} bg={4}>
        <xjoin pad={1} bg={0}>
          <para width={3} textAlign="end" invert ref={linesRef} pad={linesPad}>{Array.from({ length: fileContents.split('\n').length }, (_, i) => `${i}`).join('\n')}</para>
          {/* <para width={1} fillChar="|"></para> */}
          <zjoin flexGrow>
            <input
              ref={inputRef}
              autofocus
              multiline
              onChange={setFileContents}
              onScroll={(scroll) => {
                setTextPad(actualTextRef.current!.attributes.pad = [-scroll[0], 0, 0, -scroll[1]]);
                setLinesPad(linesRef.current!.attributes.pad = [-scroll[0], 0, 0, 0]);
              }}
            />
            <cont fillChar=".">
              <para ref={actualTextRef} pad={textPad}>
                {fileContents}
              </para>
            </cont>
            <cont fillChar={"\x09"}>
              <para ref={actualTextRef} pad={textPad}>
                <Visit code={html} sheet={sheets[theme]} />
              </para>
            </cont>
          </zjoin>
        </xjoin>
      </cont>
    </yjoin>
  );
}

export function Edit() {
  const params = new URLSearchParams(useLocation().search);
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    setPath(params.get('path') || `/tmp/miniedit-${createId()}`);
  }, []);

  if (!path) return <para>Loading...</para>

  return <Editor path={path} />;
}
