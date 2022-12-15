import { Stack } from "./Stack";
import { Summary } from "./App";
import { makeid } from "./utils";
import { changeTimeout } from "./profiled/setTimeout";
import { changePromise } from "./profiled/Promise";

export type ExecutionBlock = {
  kind: string;
  fnName: string;
  start: number;
  end: number;
  t: number;
};

export const interactionStack: Stack<string> = new Stack();
// interactionId => [startTime, executionBlocks]
export const pendingInteractions: Record<
  string,
  {
    start: number;
    executionBlocks: ExecutionBlock[];
    onDone?: (s: Summary) => void;
  }
> = {};

// context is for debugging
export function wrapIfInteracting<T extends any[], V>(
  cb: (...args: T) => V,
  context: string
): (...args: T) => V {
  const currentInteraction = interactionStack.peek();
  if (currentInteraction != null) {
    const wrapped = (...args: T): V => {
      interactionStack.push(currentInteraction, context);

      // Override scheduling functions if necessary
      const restoreTimeout = changeTimeout();
      const restorePromise = changePromise();

      // Run the function
      const start = performance.now();
      const result = cb(...args);
      const end = performance.now();

      // Undo scheduling functions override
      restoreTimeout();
      restorePromise();

      interactionStack.pop();

      console.log(`TOOK ${end - start}s`, cb);
      const fnName = cb.name || "<anonymous>";
      pendingInteractions[currentInteraction].executionBlocks.push({
        start,
        end,
        fnName,
        kind: context,
        t: end - start,
      });
      return result;
    };
    return wrapped;
  } else {
    console.log("not interacting", context);
    return cb;
  }
}

export function profile<T extends any[], V>(
  interactionName: string,
  fn: (...args: T) => V,
  onDone?: (s: Summary) => void
): (...args: T) => V {
  return (...args: T): V => {
    const interactionId = `${interactionName}#${makeid(5)}`;
    const start = performance.now();
    console.log(`KEY ${interactionId} started at ${start}`);
    performance.mark("START" + interactionId);
    pendingInteractions[interactionId] = { start, executionBlocks: [], onDone };
    interactionStack.push(interactionId, "profile_wrapper");
    // window.Promise = Promise_Profiled;
    // window.setTimeout = setTimeout_Profiled as any;
    const restoreTimeout = changeTimeout();
    const restorePromise = changePromise();
    const result = fn(...args);
    restoreTimeout();
    restorePromise();
    // window.setTimeout = setTimeout_Original;
    // window.Promise = Promise_Original;
    interactionStack.pop();
    const end = performance.now();
    const fnName = fn.name || "<anonymous>";
    pendingInteractions[interactionId].executionBlocks.push({
      start,
      end,
      fnName,
      kind: "direct_callback",
      t: end - start,
    });
    return result;
  };
}
