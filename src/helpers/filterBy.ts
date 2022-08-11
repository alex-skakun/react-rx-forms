import { filter, map, MonoTypeOperatorFunction, Observable, pipe, withLatestFrom } from 'rxjs';

export function filterBy<T>(gate: Observable<boolean>): MonoTypeOperatorFunction<T> {
  return pipe(
    withLatestFrom<T, boolean[]>(gate),
    filter(([, gateValue]) => !gateValue),
    map(([data]) => data),
  );
}
