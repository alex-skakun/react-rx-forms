import { audit, BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, of, race, startWith, switchMap, tap } from 'rxjs';
import { isNotEmptyValue } from '../helpers';
import { RxFormAbstractControl } from './RxFormAbstractControl';
import { RxFormControlAsyncValidator } from './RxFormControlAsyncValidator';
import { RxFormControlError } from './RxFormControlError';
import { RxFormControlValidator } from './RxFormControlValidator';


export type RxFormControlState<ValueType> = {
  value: ValueType;
  dirty: boolean;
  touched: boolean;
  valid: boolean;
  error: RxFormControlError;
};

export class RxFormControl<ValueType> extends RxFormAbstractControl<ValueType> {
  #initialValue: ValueType;
  #dirty: boolean;
  #error: RxFormControlError = null;
  #valid: boolean = true;
  readonly #validatorsSubject: BehaviorSubject<Array<RxFormControlValidator<ValueType>>>;
  readonly #asyncValidatorsSubject: BehaviorSubject<Array<RxFormControlAsyncValidator<ValueType>>>;
  readonly #valueSubject: BehaviorSubject<ValueType>;
  readonly #touchedSubject = new BehaviorSubject<boolean>(false);

  readonly value$: Observable<ValueType>;
  readonly dirty$: Observable<boolean>;
  readonly error$: Observable<RxFormControlError>;
  readonly valid$: Observable<boolean>;
  readonly state$: Observable<RxFormControlState<ValueType>>;
  readonly touched$: Observable<boolean> = this.#touchedSubject.pipe(distinctUntilChanged());

  constructor(
    initialValue: ValueType,
    validators: Array<RxFormControlValidator<ValueType>> = [],
    asyncValidators: Array<RxFormControlAsyncValidator<ValueType>> = []
  ) {
    super();

    this.#initialValue = initialValue;
    this.#validatorsSubject = new BehaviorSubject(validators);
    this.#asyncValidatorsSubject = new BehaviorSubject(asyncValidators);

    this.#valueSubject = new BehaviorSubject<ValueType>(initialValue);
    this.value$ = this.#valueSubject.pipe(distinctUntilChanged());

    this.#dirty = isNotEmptyValue(initialValue);
    this.dirty$ = this.value$.pipe(
      map(value => isNotEmptyValue(value)),
      distinctUntilChanged(),
      tap(dirty => this.#dirty = dirty)
    );

    this.error$ = this.value$.pipe(
      switchMap(() => this.#validatorsSubject),
      map(validators => this.#runValidators(validators)),
      switchMap(syncValidatorsResult => (
        syncValidatorsResult
          ? of(syncValidatorsResult)
          : this.#asyncValidatorsSubject.pipe(
            switchMap(asyncValidators => this.#runAsyncValidators(asyncValidators)),
            startWith(syncValidatorsResult)
          )
      )),
      distinctUntilChanged(),
      tap(error => this.#error = error)
    );

    this.valid$ = this.error$.pipe(
      map(error => error === null),
      distinctUntilChanged(),
      tap(valid => this.#valid = valid)
    );

    this.state$ = combineLatest([
      this.value$, this.dirty$, this.touched$, this.valid$, this.error$
    ]).pipe(
      audit(() => Promise.resolve()),
      map(([value, dirty, touched, valid, error]): RxFormControlState<ValueType> => ({
        value, dirty, touched, valid, error
      }))
    );
  }

  get value(): ValueType {
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

  get #validators(): Array<RxFormControlValidator<ValueType>> {
    return this.#validatorsSubject.getValue();
  }

  get #asyncValidators(): Array<RxFormControlAsyncValidator<ValueType>> {
    return this.#asyncValidatorsSubject.getValue();
  }

  setValue(value: ValueType): void {
    this.#valueSubject.next(value);
  }

  reset(initialValue?: ValueType): void {
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

  addValidator(validator: RxFormControlValidator<ValueType>): void {
    this.#validatorsSubject.next(this.#addValidatorIntoCollection(this.#validators, validator));
  }

  removeValidator(validator: RxFormControlValidator<ValueType>): void {
    this.#validatorsSubject.next(this.#removeValidatorFromCollection(this.#validators, validator));
  }

  addAsyncValidator(validator: RxFormControlAsyncValidator<ValueType>): void {
    this.#asyncValidatorsSubject.next(this.#addValidatorIntoCollection(this.#asyncValidators, validator));
  }

  removeAsyncValidator(validator: RxFormControlAsyncValidator<ValueType>): void {
    this.#asyncValidatorsSubject.next(this.#removeValidatorFromCollection(this.#asyncValidators, validator));
  }

  #addValidatorIntoCollection<T>(collection: Array<T>, validator: T): Array<T> {
    let newValidatorCollection = collection.slice();

    newValidatorCollection.push(validator);
    return newValidatorCollection;
  }

  #removeValidatorFromCollection<T>(collection: Array<T>, validator: T): Array<T> {
    return collection.filter(existingValidator => existingValidator !== validator);
  }

  #runValidators(validators: Array<RxFormControlValidator<ValueType>>): RxFormControlError {
    for (const validator of validators) {
      const validatorResult = validator(this);

      if (validatorResult) {
        return validatorResult;
      }
    }

    return null;
  }

  #runAsyncValidators(asyncValidators: Array<RxFormControlAsyncValidator<ValueType>>): Observable<RxFormControlError> {
    return race(asyncValidators.map(validator => validator(this)));
  }

}
