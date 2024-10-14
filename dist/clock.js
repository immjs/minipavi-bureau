import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { minitelContext, useKeyboard } from 'minitel-react';
import cron from 'node-cron';
import { useContext, useEffect, useState, useRef } from 'react';
import { windowContext } from './app.js';
export function Tab({ highlit, children, ...props }) {
    return (_jsx("xjoin", { pad: 1, bg: highlit ? 6 : 5, fg: highlit ? 0 : 7, widthAlign: "middle", flexGrow: true, ...props, children: children }));
}
function ClockTab(props) {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const task = cron.schedule('* * * * * *', () => {
            setTime(new Date());
        });
        return () => task.stop();
    }, []);
    return (_jsx("yjoin", { widthAlign: "middle", heightAlign: "middle", pad: [4, 2], bg: 6, fg: 0, ...props, children: _jsx("para", { doubleWidth: true, doubleHeight: true, children: time.toLocaleTimeString('en-US') }) }));
}
function TimeString({ time }) {
    // If time is less than a minute, display it in seconds and milliseconds
    // If time is less than an hour, display it in minutes and seconds
    // Otherwise, display it in hours, minutes and seconds
    const milliseconds = (time % 1000).toString().padStart(3, '0');
    const seconds = (Math.floor(time / 1000) % 60).toString().padStart(2, '0');
    const minutes = time < 3600000 ? Math.floor(time / 60000) : Math.floor(time / 60000).toString().padStart(2, '0');
    const hours = Math.floor(time / 3600000);
    if (time < 60000) {
        return _jsxs("xjoin", { heightAlign: 'end', children: [_jsx("span", { doubleWidth: true, doubleHeight: true, children: seconds }), ".", milliseconds] });
    }
    else if (time < 3600000) {
        return _jsxs("xjoin", { heightAlign: 'end', children: [_jsxs("span", { doubleWidth: true, doubleHeight: true, children: [minutes, ":", seconds] }), ".", milliseconds] });
    }
    else {
        return _jsxs("xjoin", { heightAlign: 'end', children: [_jsxs("span", { doubleWidth: true, doubleHeight: true, children: [hours, ":", minutes] }), ":", seconds] });
    }
}
function StopwatchTab(props) {
    // State for whether the stopwatch is running
    const [running, setRunning] = useState(false);
    const [displayedTime, setDisplayedTime] = useState(0);
    const [extraTime, setExtraTime] = useState(0);
    const [buttonHasFocus, setButtonHasFocus] = useState(false);
    const [focusedButton, setFocusedButton] = useState(0);
    const startedAt = useRef(null);
    const minitel = useContext(minitelContext);
    // We run a dummy command to know when the render has been completed
    // (using minitel.queueCommandAsync())
    useEffect(() => {
        const startedAtConst = startedAt.current;
        if (running) {
            let keepRunning = true;
            function animationFrame() {
                minitel.queueCommandAsync('\x1b\x39\x70', '\x1b\x3a\x71').then(() => {
                    if (!keepRunning)
                        return;
                    setDisplayedTime(Date.now() - startedAt.current);
                    animationFrame();
                });
            }
            startedAt.current = Date.now();
            animationFrame();
            return () => {
                keepRunning = false;
            };
        }
        else if (startedAtConst !== null) {
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
                    }
                    else {
                        setExtraTime(0);
                        startedAt.current = Date.now();
                    }
                    break;
            }
        }
    });
    return (_jsxs("yjoin", { gap: 1, ...props, children: [_jsx("yjoin", { widthAlign: "middle", heightAlign: "middle", pad: 2, bg: 6, fg: 0, children: _jsx(TimeString, { time: extraTime + displayedTime }) }), _jsx("focus", { autofocus: true, onFocus: () => setButtonHasFocus(true), onBlur: () => setButtonHasFocus(false), children: _jsxs("xjoin", { widthAlign: "middle", gap: 1, children: [_jsx(Tab, { highlit: focusedButton === 0, noBlink: !(buttonHasFocus && focusedButton === 0), children: running ? 'Stop' : 'Start' }), _jsx(Tab, { highlit: focusedButton === 1, noBlink: !(buttonHasFocus && focusedButton === 1), children: "Reset" })] }) })] }));
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
    return (_jsxs("yjoin", { widthAlign: "stretch", children: [_jsx("para", { bg: 7, fg: 0, textAlign: 'middle', pad: [0, 1], children: "Clock" }), _jsxs("yjoin", { flexGrow: true, heightAlign: "middle", widthAlign: 'stretch', gap: 1, pad: [1, 2], bg: 4, children: [_jsxs("xjoin", { gap: 1, children: [_jsxs(Tab, { highlit: tabFocused === 0, children: [_jsx("span", { invert: true, children: "[C]" }), " Clock"] }), _jsxs(Tab, { highlit: tabFocused === 1, children: [_jsx("span", { invert: true, children: "[S]" }), " Stopwatch"] })] }), _jsxs("zjoin", { children: [_jsx(ClockTab, { visible: tabFocused === 0, disabled: tabFocused !== 0, fillChar: tabFocused === 0 ? ' ' : '\x09' }), _jsx(StopwatchTab, { visible: tabFocused === 1, disabled: tabFocused !== 1, fillChar: tabFocused === 1 ? ' ' : '\x09' })] })] })] }));
}
