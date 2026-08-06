// Minimal, dependency-free assertions for this function's Deno tests.
// Not a general test framework — just the two primitives these tests need.
// Avoids depending on an external registry (std/jsr) being reachable at
// test time, which turned out not to be a given in every environment.

export class AssertionError extends Error {}

export function assert(condition: unknown, message = "Assertion failed"): asserts condition {
  if (!condition) throw new AssertionError(message);
}

export function assertEquals<T>(actual: T, expected: T, message?: string): void {
  const same = JSON.stringify(actual) === JSON.stringify(expected);
  if (!same) {
    throw new AssertionError(
      message ?? `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}
