import {
  asyncScheduler,
  audit,
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  of,
  race,
  scheduled,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { isNotEmptyValue } from '../helpers';
import { RxFormAbstractControl } from './RxFormAbstractControl';
import { RxFormControlAsyncValidator } from './RxFormControlAsyncValidator';
import { RxFormControlError } from './RxFormControlError';
import { RxFormControlValidator } from './RxFormControlValidator';


export type RxFormControlState<Value> = {
  value: Value;
  dirty: boolean;
  touched: boolean;
  valid: boolean;
  error: RxFormControlError;
};

export class RxFormControl<Value> extends RxFormAbstractControl<Value> {
  #initialValue: Value;
  #dirty: boolean;
  #error: RxFormControlError = null;
  #valid: boolean = true;
  readonly #validatorsSubject: BehaviorSubject<Array<RxFormControlValidator<Value>>>;
  readonly #asyncValidatorsSubject: BehaviorSubject<Array<RxFormControlAsyncValidator<Value>>>;
  readonly #valueSubject: BehaviorSubject<Value>;
  readonly #touchedSubject = new BehaviorSubject<boolean>(false);

  readonly value$: Observable<Value>;
  readonly dirty$: Observable<boolean>;
  readonly error$: Observable<RxFormControlError>;
  readonly valid$: Observable<boolean>;
  readonly state$: Observable<RxFormControlState<Value>>;
  readonly touched$: Observable<boolean> = this.#touchedSubject.pipe(distinctUntilChanged());

  constructor(
    initialValue: Value,
    validators: Array<RxFormControlValidator<Value>> = [],
    asyncValidators: Array<RxFormControlAsyncValidator<Value>> = [],
  ) {
    super();

    this.#initialValue = initialValue;
    this.#validatorsSubject = new BehaviorSubject(validators);
    this.#asyncValidatorsSubject = new BehaviorSubject(asyncValidators);

    this.#valueSubject = new BehaviorSubject<Value>(initialValue);
    this.value$ = this.#valueSubject.pipe(distinctUntilChanged());

    this.#dirty = isNotEmptyValue(initialValue);
    this.dirty$ = this.value$.pipe(
      map(value => isNotEmptyValue(value)),
      distinctUntilChanged(),
      tap(dirty => this.#dirty = dirty),
    );

    this.error$ = this.value$.pipe(
      switchMap(() => this.#validatorsSubject),
      map(validators => this.#runValidators(validators)),
      switchMap(syncValidatorsResult => (
        this.#asyncValidatorsSubject.pipe(
          switchMap(asyncValidators => (
            syncValidatorsResult
              ? of(syncValidatorsResult)
              : this.#runAsyncValidators(asyncValidators)
          )),
          startWith(syncValidatorsResult),
        )
      )),
      distinctUntilChanged(),
      tap(error => this.#error = error),
    );

    this.valid$ = this.error$.pipe(
      map(error => error === null),
      distinctUntilChanged(),
      tap(valid => this.#valid = valid),
    );

    this.state$ = combineLatest([
      this.value$, this.dirty$, this.touched$, this.valid$, this.error$,
    ]).pipe(
      audit(() => scheduled([null], asyncScheduler)),
      map(([value, dirty, touched, valid, error]): RxFormControlState<Value> => ({
        value, dirty, touched, valid, error,
      })),
      startWith({
        value: this.value,
        dirty: this.dirty,
        touched: this.touched,
        valid: this.valid,
        error: this.error,
      }),
    );
  }

  get value(): Value {
    return this.#valueSubject.getValue();
  }

  get dirty(): boolean {
    return this.#dirty;
  }

  get touched(): boolean {
    return this.#touchedSubject.getValue();
  }

  get error(): RxFormControlError {
    return this.#error;
  }

  get valid(): boolean {
    return this.#valid;
  }

  get #validators(): Array<RxFormControlValidator<Value>> {
    return this.#validatorsSubject.getValue();
  }

  get #asyncValidators(): Array<RxFormControlAsyncValidator<Value>> {
    return this.#asyncValidatorsSubject.getValue();
  }

  setValue(value: Value): void {
    this.#valueSubject.next(value);
  }

  reset(initialValue?: Value): void {
    if (initialValue !== undefined) {
      this.#initialValue = initialValue;
    }

    this.#valueSubject.next(this.#initialValue);
  }

  markAsTouched(): void {
    this.#touchedSubject.next(true);
  }

  markAsUntouched(): void {
    this.#touchedSubject.next(false);
  }

  addValidator(validator: RxFormControlValidator<Value>): void {
    this.#validatorsSubject.next(this.#addValidatorIntoCollection(this.#validators, validator));
  }

  removeValidator(validator: RxFormControlValidator<Value>): void {
    this.#validatorsSubject.next(this.#removeValidatorFromCollection(this.#validators, validator));
  }

  addAsyncValidator(validator: RxFormControlAsyncValidator<Value>): void {
    this.#asyncValidatorsSubject.next(this.#addValidatorIntoCollection(this.#asyncValidators, validator));
  }

  removeAsyncValidator(validator: RxFormControlAsyncValidator<Value>): void {
    this.#asyncValidatorsSubject.next(this.#removeValidatorFromCollection(this.#asyncValidators, validator));
  }

  #addValidatorIntoCollection<T>(collection: Array<T>, validator: T): Array<T> {
    const newValidatorCollection = collection.slice();

    newValidatorCollection.push(validator);
    return newValidatorCollection;
  }

  #removeValidatorFromCollection<T>(collection: Array<T>, validator: T): Array<T> {
    return collection.filter(existingValidator => existingValidator !== validator);
  }

  #runValidators(validators: Array<RxFormControlValidator<Value>>): RxFormControlError {
    for (const validator of validators) {
      const validatorResult = validator(this);

      if (validatorResult) {
        return validatorResult;
      }
    }

    return null;
  }

  #runAsyncValidators(asyncValidators: Array<RxFormControlAsyncValidator<Value>>): Observable<RxFormControlError> {
    return race(asyncValidators.map(validator => validator(this)));
  }

}
