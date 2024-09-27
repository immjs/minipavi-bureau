import { MemoryRouter, Route, Routes } from "react-router";
import { Finder } from "./finder.js";
import { Edit } from "./edit.js";
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from "react";
import { useKeyboard } from "minitel-react";
import { Homepage } from "./homepage.js";
import { ContainerAttributes } from "minitel-standalone";
import { MinitelObject } from "minitel-standalone/dist/abstract/minitelobject.js";
import { Term } from "./terminal.js";

interface WindowContext {
  id: number;
}
export const windowContext = createContext<WindowContext>(null as unknown as WindowContext);

function Window({ url, ...props }: { url: string } & Partial<ContainerAttributes>) {
  if (!props.visible) {
    props.fillChar = '\x09';
  }
  return (
    <cont {...props}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/finder" element={<Finder />} />
          <Route path="/edit" element={<Edit />} />
          <Route path="/term" element={<Term />} />
          <Route path="/" element={<Homepage />} />
        </Routes>
      </MemoryRouter>
    </cont>
  );
}

interface WindowData {
  url: string;
  id: number;
  visible: boolean;
}

// The typing of createContext is a joke.
type TypeofWindowingContext = [WindowData[], Dispatch<SetStateAction<WindowData[]>>];
export const windowingContext = createContext<TypeofWindowingContext>(null as unknown as TypeofWindowingContext);

enum WindowStates {
  VIEWING_CURRENT_WINDOW,
  SWITCHING_WINDOWS,
}

function WindowItems({ setWmState }: { setWmState: Dispatch<SetStateAction<WindowStates>> }) {
  const [windowing, setWindowing] = useContext(windowingContext);
  const [subfocusAt, setSubfocusAt] = useState(windowing.findIndex((v) => v.visible));
  const [hasFocus, setHasFocus] = useState(false);

  useKeyboard((v) => {
    if (hasFocus) {
      switch (v) {
        case '\x1b[\x42': {
          const newSubfocusAt = Math.min(subfocusAt + 1, (windowing.length - 1) + 1);
          setSubfocusAt(newSubfocusAt);
          setWindowing((windowing) => {
            windowing.forEach((v) => { v.visible = false; });
            if (newSubfocusAt in windowing) windowing[newSubfocusAt - 1].visible = true;
            return [...windowing];
          });
          break;
        }
        case '\x1b[\x41': {
          const newSubfocusAt = Math.max(subfocusAt - 1, 0);
          setSubfocusAt(newSubfocusAt);
          setWindowing((windowing) => {
            windowing.forEach((v) => { v.visible = false; });
            if (newSubfocusAt in windowing) windowing[newSubfocusAt].visible = true;
            return [...windowing];
          });
          break;
        }
        case '\x13\x41': {
          setWindowing((windowing) => {
            windowing.forEach((v) => { v.visible = false; });
            if (subfocusAt === windowing.length) {
              windowing.push({ id: Date.now(), url: '/', visible: true });
            } else {
              windowing[subfocusAt].visible = true;
            }
            return [...windowing];
          });
          setWmState(WindowStates.VIEWING_CURRENT_WINDOW);
        }
      }
    }
  }, [hasFocus, windowing, subfocusAt]);

  return (
    <scroll overflowX="hidden" overflowY="scroll" height={3}>
      <focus autofocus onFocus={() => setHasFocus(true)} onBlur={() => setHasFocus(false)}>
        <yjoin widthAlign="stretch" invert={false}>
          {
            windowing.map((v, i) => <WindowItem name={v.url} hasFocus={subfocusAt === i} key={i} />)
          }
          <WindowItem name="New window" hasFocus={subfocusAt === windowing.length} />
        </yjoin>
      </focus>
    </scroll>
  );
}

function WindowItem({ name, hasFocus }: { name: string, hasFocus: boolean }) {
  const paraRef = useRef<MinitelObject>(null);

  useEffect(() => {
    if (hasFocus) paraRef.current?.scrollIntoView();
  }, [hasFocus]);

  return (
    <para invert={hasFocus} ref={paraRef}>
      {name}
    </para>
  );
}

export function App() {
  const [windowing, setWindowing] = useState<WindowData[]>([
    {
      id: Date.now(),
      url: '/',
      visible: true,
    },
  ]);

  const [wmState, setWmState] = useState<WindowStates>(WindowStates.VIEWING_CURRENT_WINDOW);

  useKeyboard((v) => {
    switch (v) {
      case '\x13D': {
        if (wmState === WindowStates.SWITCHING_WINDOWS) setWmState(WindowStates.VIEWING_CURRENT_WINDOW);
        else setWmState(WindowStates.SWITCHING_WINDOWS);
        break;
      }
    }
  }, [wmState]);

  const selectedWindow = windowing.findIndex((v) => v.visible);
  const selectedWinWithNewWin = selectedWindow === -1 ? windowing.length + 1 : selectedWindow + 1;

  return (
    <zjoin>
      <windowingContext.Provider value={[windowing, setWindowing]}>
        {
          windowing.map((v, i) => (
            <Window
              key={v.id}
              url={v.url}
              disabled={!v.visible || wmState === WindowStates.SWITCHING_WINDOWS}
              visible={v.visible}
            />
          ))
        }
        <para invert fillChar={'\x09'}> {selectedWinWithNewWin}/{windowing.length} </para>
        {
          wmState === WindowStates.SWITCHING_WINDOWS
          && (
            <xjoin widthAlign="middle" heightAlign="middle" fillChar={'\x09'}>
              <cont pad={1} fillChar=" " bg={0}>
                <yjoin flexGrow pad={2} widthAlign="stretch" bg={4} gap={1}>
                  <para>Window switching</para>
                  <WindowItems setWmState={setWmState} />
                </yjoin>
              </cont>
            </xjoin>
          )
        }
      </windowingContext.Provider>
    </zjoin>
  );
}
