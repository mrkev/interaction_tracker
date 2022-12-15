import { wrapIfInteracting } from "../wrapIfInteracting";

let changed = false;
let queueMicrotask_Original = window.queueMicrotask;

function queueMicrotask_Profiled(rawHandler: () => void): void {
  const handler = wrapIfInteracting(
    rawHandler as any,
    "queueMicrotask_Profiled"
  );
  return queueMicrotask_Original(handler);
}

export function changeQueueMicrotask(): () => void {
  if (window.queueMicrotask !== queueMicrotask_Profiled) {
    queueMicrotask_Original = window.queueMicrotask;
    window.queueMicrotask = queueMicrotask_Profiled;
    changed = true;
  }

  return () => {
    if (changed) {
      window.queueMicrotask = queueMicrotask_Original;
      changed = false;
    }
  };
}
