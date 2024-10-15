import { jsx as _jsx } from "react/jsx-runtime";
import { Minitel } from 'minitel-standalone';
import { render } from 'minitel-react';
import { createMinipaviHandler } from 'minitel-minipavi';
import { App } from './app.js';
import { DuplexBridge } from 'ws-duplex-bridge';
import { Mirror, mirroringStore } from './mirroring/store.js';
// import fastifyStatic from '@fastify/static';
export default createMinipaviHandler(async (ws, request) => {
    const stream = new DuplexBridge(ws, { decodeStrings: false });
    const query = new URL(request.url, 'https://no.com').searchParams;
    if (query.has('mirroring')) {
        const mirroring = query.get('mirroring');
        const mirroringMirror = mirroring == null ? mirroring : mirroringStore[mirroring];
        if (!mirroring || !mirroringMirror)
            return stream.write('No such mirroring session');
        mirroringMirror.stream.addAs(mirroring, stream);
        mirroringMirror.renderToStream(true);
    }
    else {
        const streamMirror = new Mirror(stream);
        const minitel = new Minitel(streamMirror, { localEcho: false, statusBar: true });
        const interval = setInterval(() => {
            if (!stream.writableEnded)
                stream.write('\x00');
        }, 10_000);
        stream.on('end', () => clearInterval(interval));
        render(_jsx(App, {}), minitel);
    }
}, {
    host: '0.0.0.0',
    port: 8080,
    https: true,
});
