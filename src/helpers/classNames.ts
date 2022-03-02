export function classNames(
  ...classes: Array<{ [key: string]: unknown } | Array<string> | string | undefined | null>
): string {
  let uniqueClassNames = classes.reduce<Set<string>>((result, classItem) => {
    if (typeof classItem === 'string' && classItem) {
      result.add(classItem);
      return result;
    }
    if (Array.isArray(classItem)) {
      for (const item of classItem) {
        if (classItem) {
          result.add(item);
        }
      }
      return result;
    }
    if (classItem && typeof classItem === 'object') {
      for (const [item, value] of Object.entries<unknown>(classItem)) {
        if (value) {
          result.add(item);
        }
      }
      return result;
    }
    return result;
  }, new Set());

  return [...uniqueClassNames].join(' ');
}
