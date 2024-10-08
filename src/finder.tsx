import { Stats } from "fs";
import { lstat, readdir } from "fs/promises";
import { useKeyboard } from "minitel-react";
import { TextNode } from "minitel-standalone";
import { MinitelObject } from "minitel-standalone/dist/abstract/minitelobject.js";
import { join } from "path";
import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router";

function FinderItem({ name, isLink, isDir, hasFocus }: { name: string; isLink: boolean, isDir: boolean, hasFocus: boolean }) {
  const stuff = useRef<MinitelObject>(null);

  useEffect(() => {
    if (hasFocus) {
      stuff.current?.scrollIntoView();
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
  const [currPath, setCurrPath] = useState<string | null>(null);
  // const [currPathTmp, setCurrPathTmp] = useState(currPath);

  const [redirectTo, setRedirectTo] = useState<null | string>(null);

  const params = new URLSearchParams(useLocation().search);

  useEffect(() => {
    if (!currPath) setCurrPath(params.get('path') || process.cwd());
  });

  useEffect(() => {
    // setCurrPathTmp(currPath);
    if (currPath) {
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
    }
  }, [currPath]);

  useKeyboard((v) => {
    if (!currPath) return;
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

  if (redirectTo) return <Navigate to={redirectTo} />;

  return (
    <yjoin widthAlign="stretch">
      <para bg={7} fg={0} textAlign='middle' pad={[0, 1]}>Homepage</para>
      <yjoin flexGrow pad={2} gap={0} bg={4}>
        <para pad={1} bg={5}>{currPath}</para>
        <scroll pad={1} flexGrow bg={6} fg={0}>
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
    </yjoin>
  );
}
