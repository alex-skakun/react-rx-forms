import { BehaviorSubject, distinctUntilChanged, map, Observable, switchMap, tap } from 'rxjs';
import { isNotEmpty } from 'helpers';
import { RxFormAbstractControl } from './rx-form-abstract-item';
import { RxFormControlError } from './rx-form-control-error';
import { RxFormControlValidator } from './rx-form-control-validator';

export class RxFormControl<ValueType> extends RxFormAbstractControl<ValueType> {
  #initialValue: ValueType;
  #dirty: boolean;
  #error: RxFormControlError = null;
  #valid: boolean = true;
  readonly #validatorsSubject: BehaviorSubject<Array<RxFormControlValidator<ValueType>>>;
  readonly #valueSubject: BehaviorSubject<ValueType>;
  readonly #touchedSubject = new BehaviorSubject<boolean>(false);

  readonly value$: Observable<ValueType>;
  readonly dirty$: Observable<boolean>;
  readonly error$: Observable<RxFormControlError>;
  readonly valid$: Observable<boolean>;
  readonly touched$: Observable<boolean> = this.#touchedSubject.pipe(distinctUntilChanged());

  constructor(initialValue: ValueType, validators: Array<RxFormControlValidator<ValueType>> = []) {
    super();

    this.#initialValue = initialValue;
    this.#validatorsSubject = new BehaviorSubject(validators);

    this.#valueSubject = new BehaviorSubject<ValueType>(initialValue);
    this.value$ = this.#valueSubject.pipe(distinctUntilChanged());

    this.#dirty = isNotEmpty(initialValue);
    this.dirty$ = this.value$.pipe(
      map(value => isNotEmpty(value)),
      distinctUntilChanged(),
      tap(dirty => this.#dirty = dirty),
    );

    this.error$ = this.value$.pipe(
      switchMap(() => this.#validatorsSubject),
      map(validators => this.#runValidators(validators)),
      distinctUntilChanged(),
      tap(error => this.#error = error),
    );

    this.valid$ = this.error$.pipe(
      map(error => error === null),
      distinctUntilChanged(),
      tap(valid => this.#valid = valid),
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
    const newValidators = this.#validators.slice();

    newValidators.push(validator);
    this.#validatorsSubject.next(newValidators);
  }

  removeValidator(validator: RxFormControlValidator<ValueType>): void {
    const newValidators = this.#validators.filter(existingValidator => existingValidator !== validator);

    this.#validatorsSubject.next(newValidators);
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

}