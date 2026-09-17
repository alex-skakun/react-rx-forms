import { filter, MonoTypeOperatorFunction } from 'rxjs';

export function samplerName(name: string): MonoTypeOperatorFunction<string> {
  return filter((value) => value === name);
}
