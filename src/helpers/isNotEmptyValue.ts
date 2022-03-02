export function isNotEmptyValue(value: unknown): boolean {
  switch (typeof value) {
  case 'boolean':
    return true;
  case 'number':
    return Number.isFinite(value);
  default:
    return !!value;
  }
}
