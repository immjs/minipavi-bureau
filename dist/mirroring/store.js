import { Duplex } from "stream";
export class Mirror extends Duplex {
    duplexIn;
    writablesOut;
    mapping;
    constructor(duplexIn) {
        super({ decodeStrings: false });
        this.duplexIn = duplexIn;
        this.writablesOut = new Set();
        this.mapping = {};
        this.duplexIn.once('close', function () {
            this.writablesOut.forEach((v) => v.emit('close'));
            this.emit('close');
        }.bind(this));
        this.duplexIn.on('readable', () => this.push(this.duplexIn.read()));
    }
    addAs(name, stream) {
        if (!(name in this.mapping))
            this.mapping[name] = new Set();
        this.mapping[name].add(stream);
        this.writablesOut.add(stream);
    }
    _write(chunk, bufferEncoding, callback) {
        // console.log(chunk);
        Promise.all([
            new Promise((r) => this.duplexIn.write(chunk, bufferEncoding, r)),
            ...[...this.writablesOut].map((v) => !v.writableEnded
                ? new Promise((r) => v.write(chunk, bufferEncoding, r))
                : Promise.resolve(null)),
        ])
            .then((err) => callback(err.find((v) => v != null)));
    }
    _read(size) {
        return this.duplexIn.read(size);
    }
}
export const mirroringStore = {};
