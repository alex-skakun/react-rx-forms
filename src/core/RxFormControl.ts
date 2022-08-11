import {
  audit,
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  of,
  race,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { isEmptyInputValue, isNonEmptyArray } from 'value-guards';
import { RxFormAbstractControl } from './RxFormAbstractControl';
import { RxFormControlAsyncValidator } from './RxFormControlAsyncValidator';
import { RxFormControlError } from './RxFormControlError';
import { RxFormControlValidator } from './RxFormControlValidator';
import { shareAndSubscribe, trigger } from '../helpers';


export interface RxFormControlState<Value> {
  value: Value;
  dirty: boolean;
  touched: boolean;
  valid: boolean;
  error: RxFormControlError;
}

export class RxFormControl<Value> extends RxFormAbstractControl<Value> {
  #initialValue: Value;
  #value: Value;
  #dirty: boolean = false;
  #touched: boolean = false;
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
  readonly touched$: Observable<boolean>;

  constructor(
    initialValue: Value,
    validators: Array<RxFormControlValidator<Value>> = [],
    asyncValidators: Array<RxFormControlAsyncValidator<Value>> = [],
  ) {
    super();

    this.#initialValue = initialValue;
    this.#value = initialValue;
    this.#valueSubject = new BehaviorSubject<Value>(initialValue);
    this.#validatorsSubject = new BehaviorSubject(validators);
    this.#asyncValidatorsSubject = new BehaviorSubject(asyncValidators);

    this.value$ = this.#createValue();
    this.dirty$ = this.#createDirty();
    this.touched$ = this.#createTouched();
    this.error$ = this.#createError();
    this.valid$ = this.#createValid();
    this.state$ = this.#createState();
  }

  get value(): Value {
    return this.#value;
  }

  get dirty(): boolean {
    return this.#dirty;
  }

  get touched(): boolean {
    return this.#touched;
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

  @trigger()
  setValue(value: Value): void {
    this.#valueSubject.next(value);
  }

  reset(initialValue?: Value): void;

  @trigger()
  reset(...args: [initialValue?: Value]): void {
    if (isNonEmptyArray(args)) {
      this.#initialValue = args[0];
    }

    this.#valueSubject.next(this.#initialValue);
  }

  @trigger()
  markAsTouched(): void {
    this.#touchedSubject.next(true);
  }

  @trigger()
  markAsUntouched(): void {
    this.#touchedSubject.next(false);
  }

  @trigger()
  addValidator(validator: RxFormControlValidator<Value>): void {
    this.#validatorsSubject.next(addValidatorIntoCollection(this.#validators, validator));
  }

  @trigger()
  removeValidator(validator: RxFormControlValidator<Value>): void {
    this.#validatorsSubject.next(removeValidatorFromCollection(this.#validators, validator));
  }

  @trigger()
  addAsyncValidator(validator: RxFormControlAsyncValidator<Value>): void {
    this.#asyncValidatorsSubject.next(addValidatorIntoCollection(this.#asyncValidators, validator));
  }

  @trigger()
  removeAsyncValidator(validator: RxFormControlAsyncValidator<Value>): void {
    this.#asyncValidatorsSubject.next(removeValidatorFromCollection(this.#asyncValidators, validator));
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
    return race(asyncValidators.map(validator => validator(this))).pipe(
      tap(() => Promise.resolve().then(() => this.nextTick())),
    );
  }

  #createValue(): Observable<Value> {
    const [value$, valueSubscription] = shareAndSubscribe(this.#valueSubject.pipe(
      distinctUntilChanged(),
      tap(value => this.#value = value),
    ));
    this.addSubscription(valueSubscription);

    return value$;
  }

  #createDirty(): Observable<boolean> {
    const [dirty$, dirtySubscription] = shareAndSubscribe(this.value$.pipe(
      map(value => !isEmptyInputValue(value)),
      distinctUntilChanged(),
      tap(dirty => this.#dirty = dirty),
    ));
    this.addSubscription(dirtySubscription);

    return dirty$;
  }

  #createTouched(): Observable<boolean> {
    const [touched$, touchedSubscription] = shareAndSubscribe(this.#touchedSubject.pipe(
      distinctUntilChanged(),
      tap(touched => this.#touched = touched),
    ));
    this.addSubscription(touchedSubscription);

    return touched$;
  }

  #createError(): Observable<RxFormControlError> {
    const [error$, errorSubscription] = shareAndSubscribe(this.value$.pipe(
      switchMap(() => this.#validatorsSubject.pipe(
        map(validators => this.#runValidators(validators)),
      )),
      switchMap(syncValidatorsResult => this.#asyncValidatorsSubject.pipe(
        switchMap(asyncValidators => (
          syncValidatorsResult ? of(syncValidatorsResult) : this.#runAsyncValidators(asyncValidators)
        )),
        startWith(syncValidatorsResult),
      )),
      distinctUntilChanged(),
      tap(error => this.#error = error),
    ));
    this.addSubscription(errorSubscription);

    return error$;
  }

  #createValid(): Observable<boolean> {
    const [valid$, validSubscription] = shareAndSubscribe(this.error$.pipe(
      map(error => error === null),
      distinctUntilChanged(),
      tap(valid => this.#valid = valid),
    ));
    this.addSubscription(validSubscription);

    return valid$;
  }

  #createState(): Observable<RxFormControlState<Value>> {
    const [state$, stateSubscription] = shareAndSubscribe(
      combineLatest([this.value$, this.dirty$, this.touched$, this.valid$, this.error$])
        .pipe(
          audit(() => this.tick$),
          map(([value, dirty, touched, valid, error]): RxFormControlState<Value> => {
            return { value, dirty, touched, valid, error };
          }),
          startWith({
            value: this.value,
            dirty: this.dirty,
            touched: this.touched,
            valid: this.valid,
            error: this.error,
          }),
        ));
    this.addSubscription(stateSubscription);

    return state$;
  }
}

function addValidatorIntoCollection<T>(collection: Array<T>, validator: T): Array<T> {
  const newValidatorCollection = collection.slice();

  newValidatorCollection.push(validator);
  return newValidatorCollection;
}

function removeValidatorFromCollection<T>(collection: Array<T>, validator: T): Array<T> {
  return collection.filter(existingValidator => existingValidator !== validator);
}
