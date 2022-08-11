import { Observable, ReplaySubject, Subscription } from 'rxjs';


export function shareAndSubscribe<T>(source: Observable<T>): [Observable<T>, Subscription] {
  const subject = new ReplaySubject<T>(1);
  const subscription = source.subscribe(subject);
  const observable = subject.asObservable();


  // const connectable$ = connectable(source, {
  //   connector: () => new ReplaySubject<T>(1),
  // });
  // const subscription = connectable$.connect();

  return [observable, subscription];
}
