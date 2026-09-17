import { BehaviorSubject } from 'rxjs';

export function removeValidatorFromCollection<T>(collectionSubject: BehaviorSubject<Array<T>>, validator: T): void {
  collectionSubject.next(
    collectionSubject.getValue().filter((existingValidator) => existingValidator !== validator),
  );
}
