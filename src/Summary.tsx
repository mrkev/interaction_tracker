import type { Summary } from "./App";
import { scaleLinear } from "d3-scale";
import { useMemo } from "react";

const WIDHT = 500;

export function SummaryView({ summary }: { summary: Summary }) {
  const scaleW = useMemo(
    () =>
      scaleLinear()
        .domain([0, summary.end - summary.start])
        .range([0, WIDHT]),
    []
  );

  const renderedBlocks = [];
  let totalCPU = 0;
  let totalIdle = 0;

  for (let i = 0; i < summary.executionBlocks.length; i++) {
    const current = summary.executionBlocks[i];
    const prev = summary.executionBlocks[i - 1];
    totalCPU += current.t;

    if (prev != undefined) {
      const idle = current.start - prev.end;
      totalIdle += idle;
      renderedBlocks.push(
        <div
          key={`${i}b`}
          style={{ textAlign: "center", background: "#eee", padding: "2px" }}
        >
          <br />({idle >> 0}ms) <br /> 🕙
        </div>
      );
    }

    renderedBlocks.push(
      <div
        key={`${i}c`}
        style={{
          position: "relative",
          overflow: "hidden",
          // display: "inline-flex",
          // left: scaleX(block.start),
          justifyContent: "space-between",
          display: "flex",

          flexDirection: "column",
          flexShrink: 0,
          flexGrow: 0,
        }}
      >
        <b>{current.fnName}</b>
        {current.kind} ({current.t >> 0}ms)
        <div
          style={{
            // border: "1px solid black",
            background: "red",
            height: "12px",
            width: `${scaleW(current.t)}px`,
          }}
        ></div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        fontSize: "12px",
        gap: "2px",
      }}
    >
      {/* <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            borderLeft: "2px solid black",
            alignSelf: "flex-start",
          }}
        >
          ➡ start: {summary.executionBlocks[0].start >> 0}ms
        </div>
        <div
          style={{
            borderRight: "2px solid black",
            alignSelf: "flex-end",
          }}
        >
          end:{" "}
          {summary.executionBlocks[summary.executionBlocks.length - 1].end >> 0}
          ms ⬅
        </div>
      </div> */}

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "8px",
          alignItems: "baseline",
          justifyContent: "space-between",
          textAlign: "left",
        }}
      >
        {renderedBlocks}
      </div>

      <div
        style={{
          borderTop: "3px solid black",
        }}
      >
        Total: {summary.t >> 0}ms
        <br />
        <br />
        <div
          style={{
            display: "inline-block",
            background: "red",
            height: "12px",
            width: "12px",
          }}
        ></div>{" "}
        CPU: {totalCPU >> 0}ms
        <br />
        <div
          style={{
            display: "inline-block",
            background: "#eee",
            height: "12px",
            width: "12px",
          }}
        ></div>{" "}
        Idle: {totalIdle >> 0}ms
      </div>
    </div>
  );
}
