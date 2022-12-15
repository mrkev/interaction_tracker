import { wrapIfInteracting } from "../wrapIfInteracting";

export let Promise_Original = window.Promise;

// stack of currently executing interactions
export class Promise_Profiled<T> extends Promise<T> {
  constructor(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void
    ) => void
  ) {
    const exec = wrapIfInteracting(executor as any, "ProfiledPromise");
    super(exec);
  }
}

let changedPromise = false;

export function changePromise(): () => void {
  if (window.Promise !== Promise_Profiled) {
    Promise_Original = window.Promise;
    window.Promise = Promise_Profiled;
    changedPromise = true;
  }

  return () => {
    if (changedPromise) {
      window.Promise = Promise_Original;
      changedPromise = false;
    }
  };
}
