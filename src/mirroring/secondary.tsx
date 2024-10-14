import { mirroringStore } from "./store.js";

export function Secondary({ sessionName }: { sessionName: string }) {
  const currentMirror = mirroringStore[sessionName];

  if (!currentMirror) {
    return <yjoin widthAlign="middle" heightAlign="middle">No such mirroring session</yjoin>;
  }
}
