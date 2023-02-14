// Use regular function instead of arrow function because assertions need to have explicit type.
// See https://github.com/microsoft/TypeScript/issues/36931
export function assertDefined<T>(value: T | undefined | null, name: string): asserts value is T {
  if (typeof value === 'undefined') {
    throw new Error(`${name} is undefined`)
  }

  // eslint-disable-next-line no-null/no-null
  if (value === null) {
    throw new Error(`${name} is null`)
  }
}
