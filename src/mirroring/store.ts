import { Minitel } from "minitel-standalone";
import { Duplex, Writable } from "stream";

type ENU = Error | null | undefined;

export class Mirror extends Duplex {
  duplexIn: Duplex;
  writablesOut: Set<Writable>;

  mapping: Record<string, Set<Writable>>;

  constructor(duplexIn: Duplex) {
    super({ decodeStrings: false });
    this.duplexIn = duplexIn;
    this.writablesOut = new Set<Writable>();
    this.mapping = {};

    this.duplexIn.once(
      'close',
      function (this: Mirror) {
        this.writablesOut.forEach((v) => v.emit('close'));
        this.emit('close');
      }.bind(this),
    );
    this.duplexIn.on('readable', () =>
      this.push(this.duplexIn.read()),
    );
  }
  
  addAs(name: string, stream: Writable) {
    if (!(name in this.mapping)) this.mapping[name] = new Set<Writable>();
    this.mapping[name].add(stream);

    this.writablesOut.add(stream);
  }

  _write(
    chunk: any,
    bufferEncoding: BufferEncoding,
    callback: (err: ENU) => void,
  ): void {
    // console.log(chunk);
    Promise.all<ENU>([
      new Promise<ENU>((r) => this.duplexIn.write(chunk, bufferEncoding, r)),
      ...[...this.writablesOut].map((v) => !v.writableEnded
        ? new Promise<ENU>((r) => v.write(chunk, bufferEncoding, r))
        : Promise.resolve(null)),
    ])
      .then((err) => callback(err.find((v) => v != null)));
  }
  _read(size?: number) {
    return this.duplexIn.read(size);
  }
}

export const mirroringStore: Record<string, Minitel> = {};
