import { MonoTypeOperatorFunction, share, Subject } from 'rxjs';

export function shareThroughSubject<T>(subject: Subject<T>): MonoTypeOperatorFunction<T> {
  return share<T>({
    connector: () => subject,
    resetOnRefCountZero: true,
    resetOnComplete: false,
  });
}
