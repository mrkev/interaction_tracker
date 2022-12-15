import { interactionStack } from "./wrapIfInteracting";

export function busyWait(n: number) {
  const start = performance.now();
  let total = 0;
  while (true) {
    total++;
    const end = performance.now();
    if (end - start >= n) {
      break;
    }
  }
  console.log("WAITED", performance.now() - start, `to count to ${total}`);
}

export async function promiseWait(n: number) {
  // console.log("asyncLongTask: in interaction", interactionStack.peek());
  return new Promise<void>(function promiseWaitPromise(res) {
    // console.log("promise executing: in interaction", interactionStack.peek());
    setTimeout(function promiseWaitTimeout() {
      // console.log("timeout done: in interaction", interactionStack.peek());
      res();
    }, n);
  });
}

// Interaction tracing removed in https://github.com/facebook/react/pull/20037
export function makeid(length: number = 5) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
