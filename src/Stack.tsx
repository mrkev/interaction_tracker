export class Stack<T> {
  private arr: Array<T> = [];
  // context is for debugging console.group
  public push(val: T, context?: string): void {
    this.arr.push(val);
    console.group(context ? `${val} ${context}` : val);
    console.log("PUSH interaction stack", this.arr);
  }

  public pop(): T | null {
    const val = this.arr.pop() ?? null;
    console.log("POP interaction stack", this.arr);
    console.groupEnd();
    return val;
  }

  public peek(): T | null {
    return peek(this.arr) ?? null;
  }
}

// stack peek, looks at last element
export function peek<T>(arr: Array<T>): T | undefined {
  if (arr.length === 0) {
    return undefined;
  }
  return arr[arr.length - 1];
}
