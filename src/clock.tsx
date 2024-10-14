import { minitelContext, useKeyboard } from 'minitel-react';
import { XJoinAttributes, YJoin, YJoinAttributes } from 'minitel-standalone';
import cron from 'node-cron';
import { useContext, useEffect, useState, useRef } from 'react';
import { windowContext } from './app.js';

export function Tab({ highlit, children, ...props }: { highlit?: boolean, children: React.ReactNode } & Partial<XJoinAttributes>) {
  return (
    <xjoin
      pad={1}
      bg={highlit ? 6 : 5}
      fg={highlit ? 0 : 7}
      widthAlign="middle"
      flexGrow
      {...props}
    >
      {children}
    </xjoin>
  );
}

function ClockTab(props: Partial<YJoinAttributes>) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const task = cron.schedule('* * * * * *', () => {
      setTime(new Date());
    });

    return () => task.stop();
  }, []);

  return (
    <yjoin widthAlign="middle" heightAlign="middle" pad={[4, 2]} bg={6} fg={0} {...props}>
      <para doubleWidth doubleHeight>{time.toLocaleTimeString('en-US')}</para>
    </yjoin>
  );
}

function TimeString({ time }: { time: number }) {
  // If time is less than a minute, display it in seconds and milliseconds
  // If time is less than an hour, display it in minutes and seconds
  // Otherwise, display it in hours, minutes and seconds
  const milliseconds = (time % 1000).toString().padStart(3, '0');
  const seconds = (Math.floor(time / 1000) % 60).toString().padStart(2, '0');
  const minutes = time < 3600000 ? Math.floor(time / 60000) : Math.floor(time / 60000).toString().padStart(2, '0');
  const hours = Math.floor(time / 3600000);

  if (time < 60000) {
    return <xjoin heightAlign='end'><span doubleWidth doubleHeight>{seconds}</span>.{milliseconds}</xjoin>;
  } else if (time < 3600000) {
    return <xjoin heightAlign='end'><span doubleWidth doubleHeight>{minutes}:{seconds}</span>.{milliseconds}</xjoin>;
  } else {
    return <xjoin heightAlign='end'><span doubleWidth doubleHeight>{hours}:{minutes}</span>:{seconds}</xjoin>;
  }
}

function StopwatchTab(props: Partial<YJoinAttributes>) {
  // State for whether the stopwatch is running
  const [running, setRunning] = useState(false);
  const [displayedTime, setDisplayedTime] = useState(0);
  const [extraTime, setExtraTime] = useState(0);

  const [buttonHasFocus, setButtonHasFocus] = useState(false);
  const [focusedButton, setFocusedButton] = useState(0);

  const startedAt = useRef<number | null>(null);

  const minitel = useContext(minitelContext);

  // We run a dummy command to know when the render has been completed
  // (using minitel.queueCommandAsync())
  useEffect(() => {
    const startedAtConst = startedAt.current;
    if (running) {
      let keepRunning = true;
      function animationFrame() {
        minitel.queueCommandAsync('\x1b\x39\x70', '\x1b\x3a\x71').then(() => {
          if (!keepRunning) return;
          setDisplayedTime(Date.now() - startedAt.current!);
          animationFrame();
        });
      }
      startedAt.current = Date.now();
      animationFrame();
      return () => {
        keepRunning = false;
      };
    } else if (startedAtConst !== null) {
      setDisplayedTime(0);
      setExtraTime((extra) => extra + Date.now() - startedAtConst);
    }
  }, [running]);

  useKeyboard((key) => {
    if (buttonHasFocus) {
      switch (key) {
        case '\x1b[C':
          setFocusedButton((prev) => (prev + 1) % 2);
          break;
        case '\x1b[D':
          setFocusedButton((prev) => (prev + 1) % 2);
          break;
        case '\x13\x41':
          if (focusedButton === 0) {
            setRunning((prev) => !prev);
          } else {
            setExtraTime(0);
            startedAt.current = Date.now();
          }
          break;
      }
    }
  });
  
  return (
    <yjoin gap={1} {...props}>
      <yjoin widthAlign="middle" heightAlign="middle" pad={2} bg={6} fg={0}>
        <TimeString time={extraTime + displayedTime} />
      </yjoin>
      <focus autofocus onFocus={() => setButtonHasFocus(true)} onBlur={() => setButtonHasFocus(false)}>
        <xjoin widthAlign="middle" gap={1}>
          <Tab highlit={focusedButton === 0} noBlink={!(buttonHasFocus && focusedButton === 0)}>
            {running ? 'Stop' : 'Start'}
          </Tab>
          <Tab highlit={focusedButton === 1} noBlink={!(buttonHasFocus && focusedButton === 1)}>
            Reset
          </Tab>
        </xjoin>
      </focus>
    </yjoin>
  );
}

export function Clock() {
  const setWindowName = useContext(windowContext).setWindowName;
  useEffect(() => setWindowName('Clock'), []);

  const [tabFocused, setTabFocused] = useState(0);
  
  useKeyboard((key) => {
    switch (key.toUpperCase()) {
      case 'C':
        setTabFocused(0);
        break;
      case 'S':
        setTabFocused(1);
        break;
    }
  });

  return (
    <yjoin widthAlign="stretch">
      <para bg={7} fg={0} textAlign='middle' pad={[0, 1]}>Clock</para>
      <yjoin flexGrow heightAlign="middle" widthAlign='stretch' gap={1} pad={[1, 2]} bg={4}>
        <xjoin gap={1}>
          <Tab highlit={tabFocused === 0}><span invert>[C]</span> Clock</Tab>
          <Tab highlit={tabFocused === 1}><span invert>[S]</span> Stopwatch</Tab>
        </xjoin>
        <zjoin>
          <ClockTab visible={tabFocused === 0} disabled={tabFocused !== 0} fillChar={tabFocused === 0 ? ' ' : '\x09'} />
          <StopwatchTab visible={tabFocused === 1} disabled={tabFocused !== 1} fillChar={tabFocused === 1 ? ' ' : '\x09'} />
        </zjoin>
      </yjoin>
    </yjoin>
  );
}
