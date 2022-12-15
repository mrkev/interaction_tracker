import { wrapIfInteracting } from "../wrapIfInteracting";

export let setTimeout_Original = window.setTimeout;
let changedTimeout = false;

export const setTimeout_Profiled = (
  rawHandler: Function,
  timeout?: number,
  ...args: any[]
): number => {
  const handler = wrapIfInteracting(rawHandler as any, "setTimeout_Profiled");
  const id = setTimeout_Original(handler, timeout, ...args);
  return id;
};

export function changeTimeout(): () => void {
  if (window.setTimeout !== setTimeout_Profiled) {
    setTimeout_Original = window.setTimeout;
    window.setTimeout = setTimeout_Profiled as any;
    changedTimeout = true;
  }

  return () => {
    if (changedTimeout) {
      window.setTimeout = setTimeout_Original;
      changedTimeout = false;
    }
  };
}
