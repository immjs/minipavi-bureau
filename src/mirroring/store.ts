import { Duplex, Writable } from "stream";

export class Mirror extends Duplex {
  duplexIn: Duplex;
  writableOut: Writable;

  constructor(duplexIn: Duplex, writableOut: Writable) {
    super({ decodeStrings: false });
    this.duplexIn = duplexIn;
    this.writableOut = writableOut;

    this.duplexIn.once(
      'close',
      function (this: Mirror) {
        this.writableOut.emit('close');
        this.emit('close');
      }.bind(this),
    );
    this.duplexIn.on('readable', () =>
      this.push(this.duplexIn.read()),
    );
  }

  _write(
    chunk: any,
    bufferEncoding: BufferEncoding,
    callback: (err: Error | null | undefined) => void,
  ): void {
    Promise.all<Error | null | undefined>([
      new Promise<Error | null | undefined>((r) => this.duplexIn.write(chunk, bufferEncoding, r)),
      !this.writableOut.writableEnded
      ? new Promise<Error | null | undefined>((r) => this.writableOut.write(chunk, bufferEncoding, r))
      : Promise.resolve(null),
    ]).then((err) => callback(err[0] ?? err[1]))
  }
  _read(size?: number) {
    return this.duplexIn.read(size);
  }
}

export const mirroringStore: Record<string, Mirror> = {};
