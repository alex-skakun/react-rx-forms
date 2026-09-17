import { BehaviorSubject } from 'rxjs';

export function addValidatorIntoCollection<T>(collectionSubject: BehaviorSubject<Array<T>>, validator: T): void {
  collectionSubject.next(
    collectionSubject.getValue().concat(validator),
  );
}
