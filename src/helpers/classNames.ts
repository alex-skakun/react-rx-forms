import { isDefined } from 'value-guards';


export function classNames(
  ...args: Array<Record<string, unknown> | Array<string | null | undefined> | string | undefined | null>
): string {
  const uniqueClassNames = args.reduce<Set<string>>((results, argument) => {
    if (!isDefined(argument)) {
      return results;
    }

    if (argument && typeof argument === 'string') {
      return handleStringArgument(argument, results);
    }

    if (Array.isArray(argument)) {
      return argument.length ? handleArrayArgument(argument, results) : results;
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

  loopFor(cssClasses, cssClass => {
    if (cssClass) {
      results.add(cssClass);
    }
  });

  return results;
}

function handleArrayArgument(argument: Array<string | null | undefined>, results: Set<string>): Set<string> {
  loopFor(argument, item => {
    if (item) {
      handleStringArgument(item, results);
    }
  });

  return results;
}

function handleObjectArgument(argument: Record<string, unknown>, results: Set<string>): Set<string> {
  loopFor(Object.entries<unknown>(argument), ([cssClass, isAdded]) => {
    if (isAdded && cssClass) {
      handleStringArgument(cssClass, results);
    }
  });

  return results;
}

function loopFor<T>(arr: T[], cb: (item: T) => void): void {
  for (let i = 0, l = arr.length; i < l; i++) {
    cb(arr[i]);
  }
}
