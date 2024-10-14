import { useKeyboard } from "minitel-react";
import { useContext, useEffect, useState } from "react";
import { apps } from "./apps.js";
import { windowContext, windowingContext } from "./app.js";
import { useNavigate } from "react-router";

export function Homepage() {
  const setWindowName = useContext(windowContext).setWindowName;
  useEffect(() => setWindowName('Homepage'), []);

  const [userInput, setUserInput] = useState('');

  const navigate = useNavigate();

  useKeyboard((v) => {
    if (v === '\x13\x41') {
      const app = apps.find((v) => v.name === userInput);
      if (!app) return;
      navigate(app.path);
    }
  });

  return (
    <yjoin widthAlign="stretch">
      <para bg={7} fg={0} textAlign='middle' pad={[0, 1]}>Homepage</para>
      <yjoin flexGrow widthAlign="middle" heightAlign="middle" bg={4}>
        <yjoin widthAlign="stretch" width={24}>
          <xjoin widthAlign="middle" bg={5} doubleWidth doubleHeight pad={2}>
            MiniSys
          </xjoin>
          <yjoin widthAlign="stretch" bg={6} fg={0} pad={[1, 2]} gap={1}>
            <yjoin widthAlign="stretch">
              <span>Application:</span>
              <input autofocus onChange={(v) => setUserInput(v)} />
              <scroll height={3}>
                <yjoin>
                  {
                    apps
                      .filter((v) => v.name.startsWith(userInput))
                      .map((v, i) => (<para key={v.name}>{v.name}|<span fg={1}>{v.description}</span></para>))
                  }
                </yjoin>
              </scroll>
            </yjoin>
          </yjoin>
        </yjoin>
      </yjoin>
    </yjoin>
  );
}
