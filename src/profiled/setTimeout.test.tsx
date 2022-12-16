import { changeTimeout } from "./setTimeout";

const setTimeout_Original = setTimeout;

describe("changeTimeout", () => {
  it("1-lvl nesting", () => {
    const restoreTimeout = changeTimeout();
    expect(setTimeout === setTimeout_Original).toBe(false);
    restoreTimeout();
    expect(setTimeout).toBe(setTimeout_Original);
  });

  it("3-lvl nesting", () => {
    const restoreTimeout1 = changeTimeout();
    const restoreTimeout2 = changeTimeout();
    const restoreTimeout3 = changeTimeout();

    expect(setTimeout === setTimeout_Original).toBe(false);
    restoreTimeout3();
    console.log(setTimeout);
    expect(setTimeout).toBe(setTimeout_Original);
    restoreTimeout2();
    restoreTimeout1();
  });
});
