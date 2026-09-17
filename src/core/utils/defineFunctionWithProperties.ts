import { objectEntries } from 'react-cool-utils';
import { createObjectFromEntries } from './createObjectFromEntries';

export function defineFunctionWithProperties<
  Fn extends (...args: any[]) => any,
  Properties extends Record<keyof any, any>,
>(fn: Fn, properties: Properties): Fn & Properties {
  return Object.defineProperties(fn, createObjectFromEntries(
    objectEntries(properties) as Iterable<[keyof any, any]>,
    (value, propertyName) => [propertyName, {
      configurable: false,
      enumerable: false,
      writable: false,
      value,
    }],
  )) as (Fn & Properties);
}
