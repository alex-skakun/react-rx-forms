export function createObjectFromEntries<Key extends keyof any, Value, MapResult = Value>(
  entries: Iterable<[Key, Value]>,
  mapFn?: (value: Value, key: Key, index: number) => MapResult,
): Record<Key, MapResult> {
  return Object.fromEntries(
    Array.from(entries, ([key, value], index) => [key, mapFn ? mapFn(value, key, index) : value])
  ) as Record<Key, MapResult>;
}
