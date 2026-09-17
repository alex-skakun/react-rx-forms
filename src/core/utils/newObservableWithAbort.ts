import { Observable, Subject, Subscriber, Subscription, TeardownLogic } from 'rxjs';

export function newObservableWithAbort<Value, Reason = any>(
  subscribe: (observer: Subscriber<Value>, abort$: Observable<Reason>) => TeardownLogic,
  reason?: Reason,
): Observable<Value> {
  return new Observable<Value>((observer) => {
    const subscription = new Subscription();
    const abortSubject = new Subject<Reason>();

    subscription.add(() => {
      abortSubject.error(reason as Reason);
    });
    subscription.add(subscribe(observer, abortSubject.asObservable()));

    return () => subscription.unsubscribe();
  });
}
