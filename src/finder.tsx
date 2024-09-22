import { Stats } from "fs";
import { lstat, readdir } from "fs/promises";
import { useKeyboard } from "minitel-react";
import { TextNode } from "minitel-standalone";
import { MinitelObject } from "minitel-standalone/dist/abstract/minitelobject.js";
import { join } from "path";
import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router";

function FinderItem({ name, isLink, isDir, hasFocus }: { name: string; isLink: boolean, isDir: boolean, hasFocus: boolean }) {
  const stuff = useRef<MinitelObject>(null);

  useEffect(() => {
    if (hasFocus) {
      stuff.current?.scrollIntoView();
      console.log((stuff.current?.children[0] as TextNode).text);
    }
  }, [hasFocus]);

  return (
    <para
      ref={stuff}
      invert={hasFocus}
    >
      {`${name === '..' ? '^^^' : isLink ? '[>]' : isDir ? '[ ]' : ' * '} ${name === '..' ? 'Up a dir' : name}`}
    </para>
  );
}

export function Finder() {
  // return <para>AAAA</para>;

  const [hasFocus, setHasFocus] = useState(false);
  const [focusedFile, setFocusedFile] = useState(0);
  const [currFiles, setCurrFiles] = useState<{ name: string, isLink: boolean, isDir: boolean }[]>([]);
  const [currPath, setCurrPath] = useState(process.cwd());
  // const [currPathTmp, setCurrPathTmp] = useState(currPath);

  const [redirectTo, setRedirectTo] = useState<null | string>(null);

  useEffect(() => {
    // setCurrPathTmp(currPath);
    readdir(currPath)
      .then(async (filenames) => {
        setCurrFiles([
          ...(currPath === '/' ? [] : [{ name: '..', isDir: true, isLink: false }]),
          ...(await Promise.all(
            filenames.map((filename, i) => lstat(join(currPath, filename))
              .then((stats) => ({
                name: filename,
                isLink: stats.isSymbolicLink(),
                isDir: stats.isDirectory(),
              })),
            )
          )),
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

  if (redirectTo) return <Navigate to={redirectTo} />;

  return (
    <yjoin pad={[0, 2]} gap={1}>
      <para>{currPath}</para>
      <scroll flexGrow>
        <focus autofocus onFocus={() => setHasFocus(true)} onBlur={() => setHasFocus(false)}>
          <yjoin>
            {
              currFiles.map((v, i) => (
                <FinderItem
                  name={v.name}
                  isLink={v.isLink}
                  isDir={v.isDir}
                  hasFocus={i === focusedFile}
                  key={v.name}
                />
              ))
            }
          </yjoin>
        </focus>
      </scroll>
    </yjoin>
  );
}
