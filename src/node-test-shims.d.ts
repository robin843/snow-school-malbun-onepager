// Minimal typings so Node's built-in test runner modules typecheck without @types/node.
declare module "node:test" {
  const test: (name: string, fn: () => void | Promise<void>) => void;
  export default test;
  export { test };
}
declare module "node:assert/strict" {
  const assert: {
    (value: unknown, message?: string): void;
    equal(actual: unknown, expected: unknown, message?: string): void;
    deepEqual(actual: unknown, expected: unknown, message?: string): void;
    ok(value: unknown, message?: string): void;
    throws(fn: () => unknown, expected?: unknown): void;
  };
  export default assert;
}
