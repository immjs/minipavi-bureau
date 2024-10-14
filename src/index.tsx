import { Minitel } from 'minitel-standalone';
import { render } from 'minitel-react';
import { createMinipaviHandler } from 'minitel-minipavi';

import { App } from './app.js';
import { DuplexBridge } from 'ws-duplex-bridge';

export default createMinipaviHandler(
  async (ws) => {
    const stream = new DuplexBridge(ws, { decodeStrings: false });
    const minitel = new Minitel(stream, { localEcho: false, statusBar: true });

    const interval = setInterval(() => {
      if (!stream.writableEnded) stream.write('\x00')
    }, 10_000);
    stream.on('end', () => clearInterval(interval));

    const query = new URL(ws.url).searchParams;
    if (query.has('mirroring')) {
      const mirroring = query.get('mirroring');

      render(<MirrorSecondary />, minitel);
    } else {
      render(<App />, minitel);
    }
  },
  {
    host: '0.0.0.0',
    port: 8080,
    https: true,
  },
);
