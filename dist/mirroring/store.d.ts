import { Minitel } from "minitel-standalone";
import { Duplex, Writable } from "stream";
type ENU = Error | null | undefined;
export declare class Mirror extends Duplex {
    duplexIn: Duplex;
    writablesOut: Set<Writable>;
    mapping: Record<string, Set<Writable>>;
    constructor(duplexIn: Duplex);
    addAs(name: string, stream: Writable): void;
    _write(chunk: any, bufferEncoding: BufferEncoding, callback: (err: ENU) => void): void;
    _read(size?: number): any;
}
export declare const mirroringStore: Record<string, Minitel>;
export {};
