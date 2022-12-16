import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { busyWait, promiseWait } from "./utils";
import "./styles.css";
import { SummaryView } from "./Summary";
import {
  pendingInteractions,
  interactionStack,
  profile,
  ExecutionBlock,
} from "./wrapIfInteracting";

function useProfiledState<S>(
  name: string,
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>] {
  const [state, setState] = useState(initialState);
  const [profileStateChange] = useInteractionProfiler(name, {
    end: "next_render",
  });
  return [state, profileStateChange(setState)];
}

type ProfileFn<T extends any[], V> = (
  fn: (...args: T) => V
) => (...args: T) => V;

function useInteractionProfiler<T extends any[], V>(
  name: string,
  options: {
    end: "next_render";
    onDone?: (summary: Summary) => void;
  }
): [ProfileFn<T, V>] {
  const startRender = performance.now();
  const onDone = options.onDone;
  // useEffect so it happens after we render
  useEffect(() => {
    console.log("EFFECT");
    if (options.end !== "next_render") {
      return;
    }

    // a single re-render can end many interactions, right? TODO
    let foundKeys = [];
    for (const key in pendingInteractions) {
      // TODO, flimsy. Make id an actual tuple and just use Maps instead of Records where appropriate
      const [name, id] = key.split("#");
      if (name != null && id != null) {
        foundKeys.push(key);
        break;
      }
    }

    const finalEnd = performance.now();
    for (const key of foundKeys) {
      const interaction = pendingInteractions[key];
      performance.mark("END" + key);
      performance.measure(key, "START" + key, "END" + key);
      console.log(`KEY ${key} ended at ${finalEnd}`);
      const summary: Summary = {
        t: finalEnd - interaction.start,
        start: interaction.start,
        end: finalEnd,
        executionBlocks: interaction.executionBlocks,
      };

      summary.executionBlocks.push({
        start: startRender,
        end: finalEnd,
        t: finalEnd - startRender,
        kind: "component_render",
        fnName: "<unknown>",
      });
      console.log(summary);
      delete pendingInteractions[key];
      interaction.onDone?.(summary);
    }
  });

  return [
    (fn: (...args: T) => V) => {
      return profile(name, fn, onDone);
    },
  ];
}

export type Summary = {
  start: number;
  end: number;
  t: number;
  executionBlocks: Array<ExecutionBlock>;
};

export default function App() {
  const [summary, setSummary] = useState<Summary[]>([]);
  const addSummary = (s: Summary) => {
    console.log("adding", s);
    setSummary((prev) => prev.concat([s]));
  };
  const [msg2, setMsg2] = useState("");
  const [message, setMessage] = useProfiledState("set-state-message", "");
  const [profileComplex] = useInteractionProfiler("complex-button", {
    end: "next_render",
    onDone: addSummary,
  });
  const [profileSimple] = useInteractionProfiler("simple-button", {
    end: "next_render",
    onDone: addSummary,
  });
  const [profilePromises] = useInteractionProfiler("promise-button", {
    end: "next_render",
    onDone: addSummary,
  });

  console.log("rendering: in interaction", interactionStack.peek());
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <button
        onClick={() => {
          profileSimple(() => {
            busyWait(600);
            setTimeout(() => {
              setMsg2(String(Math.random()));
            }, 1000);
          })();
          console.log("THIS ISN'T PROFILED");
        }}
      >
        long task?
      </button>
      <button
        onClick={profileComplex(() => {
          busyWait(600);

          setTimeout(() => {
            busyWait(400);

            setTimeout(() => {
              busyWait(200);
              setMsg2(String(Math.random()));
            }, 1000);
          }, 1000);
        })}
      >
        complex
      </button>
      <button
        onClick={profilePromises(async () => {
          busyWait(500);
          await promiseWait(500);
          setMsg2(String(Math.random()));
        })}
      >
        promises
      </button>
      <button
        onClick={() => {
          setMessage("hello world");
        }}
      >
        only state
      </button>
      {message}
      {msg2}
      <br />
      Summary:
      <pre style={{ textAlign: "start" }}>
        {JSON.stringify(summary, null, 2)}
      </pre>
      {summary[0] && <SummaryView summary={summary[0]} />}
    </div>
  );
}
