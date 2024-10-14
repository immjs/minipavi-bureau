import { Stats } from "fs";
import { lstat, mkdir, readdir, writeFile } from "fs/promises";
import { useKeyboard } from "minitel-react";
import { MinitelObject } from "minitel-standalone/dist/abstract/minitelobject.js";
import path, { join } from "path";
import { useContext, useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { windowContext } from "./app.js";

function FinderItem({ name, isLink, isDir, hasFocus, noBlink }: { name: string; isLink: boolean, isDir: boolean, hasFocus: boolean, noBlink: boolean }) {
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
      noBlink={noBlink}
    >
      {`${name === '..' ? '^^^' : isLink ? '[>]' : isDir ? '[ ]' : ' * '} ${name === '..' ? 'Up a dir' : name}`}
    </para>
  );
}

enum FinderStates {
  CREATING_FILE,
  CREATING_DIR,
  DEFAULT,
}

export function Finder() {
  const setWindowName = useContext(windowContext).setWindowName;
  useEffect(() => setWindowName('Finder'), []);

  const [hasFocus, setHasFocus] = useState(false);
  const [focusedFile, setFocusedFile] = useState(0);
  const [currFiles, setCurrFiles] = useState<{ name: string, isLink: boolean, isDir: boolean }[]>([]);
  const [currPath, setCurrPath] = useState<string | null>(null);
  // const [currPathTmp, setCurrPathTmp] = useState(currPath);

  const [appState, setAppState] = useState<FinderStates>(FinderStates.DEFAULT);

  const navigate = useNavigate();

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

  const [isCreating, setIsCreating] = useState(false);
  const [newFilename, setNewFilename] = useState('');

  useKeyboard((v) => {
    if (!currPath) return;
    if (appState === FinderStates.CREATING_FILE) {
      switch (v) {
        case '\x13\x41':
          if (newFilename === '') { setAppState(FinderStates.DEFAULT); return; }
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
          if (newFilename === '') { setAppState(FinderStates.DEFAULT); return; }
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
    if (!hasFocus) return;
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
    return (
      <yjoin widthAlign="stretch">
        <para bg={7} fg={0} textAlign='middle' pad={[0, 1]}>Homepage</para>
        <yjoin flexGrow widthAlign="middle" heightAlign="middle" pad={2} bg={4}>
          <yjoin widthAlign="stretch" width={24} gap={1} disabled={isCreating}>
            <yjoin>
              <xjoin widthAlign="end" pad={1} bg={5}><para>{currPath}</para></xjoin>
              <yjoin widthAlign="stretch" bg={6} fg={0} pad={1}>
                <span>New file name</span>
                <input autofocus onChange={(v) => setNewFilename(v)} />
              </yjoin>
            </yjoin>
            <para pad={1} bg={5} textAlign="middle">
              <span invert>[ENVOI]</span> Create file
            </para>
          </yjoin>
        </yjoin>
      </yjoin>
    );
  }
  if (appState === FinderStates.CREATING_DIR) {
    return (
      <yjoin widthAlign="stretch">
        <para bg={7} fg={0} textAlign='middle' pad={[0, 1]}>Homepage</para>
        <yjoin flexGrow widthAlign="middle" heightAlign="middle" pad={2} bg={4}>
          <yjoin widthAlign="stretch" width={24} gap={1} disabled={isCreating}>
            <yjoin>
              <xjoin widthAlign="end" pad={1} bg={5}><para>{currPath}</para></xjoin>
              <yjoin widthAlign="stretch" bg={6} fg={0} pad={1}>
                <span>New directory name</span>
                <input autofocus onChange={(v) => setNewFilename(v)} />
              </yjoin>
            </yjoin>
            <para pad={1} bg={5} textAlign="middle">
              <span invert>[ENVOI]</span> Create dir
            </para>
          </yjoin>
        </yjoin>
      </yjoin>
    );
  }

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
                    noBlink={!(hasFocus && i === focusedFile)}
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
