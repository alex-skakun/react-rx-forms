export function classNames(
  ...args: Array<Record<string, unknown> | Array<string> | string | undefined | null>
): string {
  const uniqueClassNames = args.reduce<Set<string>>((results, argument) => {
    if (argument && typeof argument === 'string') {
      return handleStringArgument(argument, results);
    }

    if (Array.isArray(argument)) {
      return handleArrayArgument(argument, results);
    }

    if (argument && typeof argument === 'object') {
      handleObjectArgument(argument, results);
    }

    return results;
  }, new Set());

  return [...uniqueClassNames].join(' ');
}

function handleStringArgument(argument: string, results: Set<string>): Set<string> {
  const cssClasses = argument.split(/\s+/);

  for (const cssClass of cssClasses) {
    results.add(cssClass);
  }

  return results;
}

function handleArrayArgument(argument: Array<string>, results: Set<string>): Set<string> {
  for (const item of argument) {
    if (argument) {
      results.add(item);
    }
  }

  return results;
}

function handleObjectArgument(argument: Record<string, unknown>, results: Set<string>): Set<string> {
  for (const [cssClass, isAdded] of Object.entries<unknown>(argument)) {
    if (isAdded) {
      results.add(cssClass);
    }
  }

  return results;
}
