import { BehaviorSubject, distinctUntilChanged, map, Observable, share, Subject } from 'rxjs';
import { RxFormControlError } from './RxFormControlError';
import { RxFormErrors } from './RxFormErrors';
import { RxFormValidator } from './RxFormValidator';
import { RxFormControlAsyncValidator } from './RxFormControlAsyncValidator';
import { InitialValue } from './InitialValue';
import { ControlValue } from './ControlValue';
import { normalizeControlValue } from '../helpers/normalizeControlValue';
import { isEmptyInputValue } from 'value-guards';

export abstract class RxFormAbstractControl<ValueType, ErrorType> {
  readonly #disabledShareSubject: BehaviorSubject<boolean>;
  readonly #valueShareSubject: BehaviorSubject<ControlValue<ValueType>>;
  readonly #dirtyShareSubject: BehaviorSubject<boolean>;
  readonly #touchedShareSubject: BehaviorSubject<boolean>;
  readonly #errorsShareSubject: BehaviorSubject<ErrorType | null>;
  readonly #validShareSubject: BehaviorSubject<boolean>;

  readonly #disabled = new BehaviorSubject<boolean>(false);
  readonly #dirty = new BehaviorSubject<boolean>(false);
  readonly #touched = new BehaviorSubject<boolean>(false);
  readonly #errors = new BehaviorSubject<ErrorType | null>(null);
  readonly #valid = new BehaviorSubject<boolean>(true);
  readonly #stateSampler = new Subject<void>();

  readonly value$: Observable<ControlValue<ValueType>>;
  readonly dirty$: Observable<boolean>;
  readonly touched$: Observable<boolean>;
  readonly error$: Observable<RxFormControlError> | Observable<RxFormErrors>;
  readonly valid$: Observable<boolean>;

  protected readonly stateSampler$ = this.#stateSampler.asObservable();

  protected constructor(
    initialValue: InitialValue<ValueType> = null,
    options: Partial<{
      disabled: boolean,
      touched: boolean,
      validators: Array<RxFormValidator<ValueType>>,
      asyncValidators: Array<RxFormControlAsyncValidator<ValueType>>,
    }>,
  ) {
    const value = normalizeControlValue(initialValue);
    const dirty = !isEmptyInputValue(value);
    this.#valueShareSubject = new BehaviorSubject(value);
    this.#dirtyShareSubject = new BehaviorSubject(dirty);
    this.#touchedShareSubject = new BehaviorSubject(false);
    this.value$ = this.#createValue(value, this.#valueShareSubject);
  }

  get disabled(): boolean {
    return this.#disabledShareSubject.getValue();
  }

  get value(): ControlValue<ValueType> {
    return this.#valueShareSubject.getValue();
  }

  get dirty(): boolean {
    return this.#dirtyShareSubject.getValue();
  }

  get touched(): boolean {
    return this.#touchedShareSubject.getValue();
  }

  get errors(): ErrorType | null {
    return this.#errorsShareSubject.getValue();
  }

  get valid(): boolean {
    return this.#validShareSubject.getValue();
  }

  protected abstract initValueSource(initialValue: InitialValue<ValueType>): Observable<ControlValue<ValueType>>;

  abstract setValue(value: InitialValue<ValueType>): void;

  abstract reset(initialValue?: InitialValue<ValueType>): void;

  protected abstract initTouchedSource(): Observable<boolean>;

  abstract markAsTouched(): void;

  abstract markAsUntouched(): void;

  protected abstract initErrorsSource(): Observable<ErrorType | null>;

  protected triggerStateSampler(): void {
    this.#stateSampler.next();
  }

  #createValue(
    initialValue: InitialValue<ValueType>,
    shareSubject: BehaviorSubject<ControlValue<ValueType>>,
  ): Observable<ControlValue<ValueType>> {
    return this.initValueSource(initialValue).pipe(
      map((value) => normalizeControlValue(value)),
      distinctUntilChanged(),
      share({
        connector: () => shareSubject,
        resetOnRefCountZero: false,
        resetOnComplete: false,
      }),
    );
  }
}
