import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, of, switchMap, tap } from 'rxjs';
import { RxFormAbstractControl } from './RxFormAbstractControl';
import { RxFormControlError } from './RxFormControlError';
import { RxFormErrors } from './RxFormErrors';
import { shareAndSubscribe } from '../helpers';


export type ControlsArray<Value, Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>> = Array<Control>;
type ControlsReadonlyArray<Value, Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>> = ReadonlyArray<Control>;

export class RxFormArray<Value, Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>> extends RxFormAbstractControl<Array<Value>> {
  readonly #controlsSubject: BehaviorSubject<ControlsArray<Value, Control>>;
  #value: Array<Value>;
  #dirty: boolean;
  #touched: boolean;
  #valid: boolean;
  #error: RxFormErrors<Array<Value>>;

  readonly value$: Observable<Array<Value>>;
  readonly dirty$: Observable<boolean>;
  readonly touched$: Observable<boolean>;
  readonly valid$: Observable<boolean>;
  readonly error$: Observable<RxFormErrors<Array<Value>>>;

  constructor(controls: ControlsArray<Value, Control> = []) {
    super();

    this.#controlsSubject = new BehaviorSubject(controls);

    this.value$ = this.#createValue();
    this.dirty$ = this.#createDirty();
    this.touched$ = this.#createTouched();
    this.error$ = this.#createError();
    this.valid$ = this.#createValid();

    this.#value = this.value;
    this.#dirty = this.dirty;
    this.#touched = this.touched;
    this.#error = this.error;
    this.#valid = this.valid;
  }

  get value(): Array<Value> {
    return this.#value;
  }

  get dirty(): boolean {
    return this.#dirty;
  }

  get touched(): boolean {
    return this.#touched;
  }

  get valid(): boolean {
    return this.#valid;
  }

  get error(): RxFormErrors<Array<Value>> {
    return this.#error;
  }

  get controls(): ControlsReadonlyArray<Value, Control> {
    return this.#controlsSubject.getValue();
  }

  markAsTouched(): void {
    for (let control of this.controls) {
      control.markAsTouched();
    }
  }

  markAsUntouched(): void {
    for (let control of this.controls) {
      control.markAsUntouched();
    }
  }

  reset(): void {
    for (let controlIndex of this.controls.keys()) {
      this.getControlAt(controlIndex).reset();
    }
  }

  setValue(value: Array<Value>): void {
    for (let [index, itemValue] of value.entries()) {
      this.getControlAt(index).setValue(itemValue);
    }
  }

  getControlAt(position: number): RxFormAbstractControl<Value> {
    return this.controls[position];
  }

  addControl(control: Control, position?: number): void {
    let controlsCopy = this.#controlsSubject.getValue().slice();

    if (position === undefined) {
      controlsCopy.push(control);
    } else {
      controlsCopy.splice(position, 0, control);
    }

    this.#controlsSubject.next(controlsCopy);
  }

  removeControlAt(position: number): void {
    let updatedControls = this.#controlsSubject.getValue().filter((_, index) => index !== position);

    this.#controlsSubject.next(updatedControls);
  }

  removeControl(control: Control): void {
    let updatedControls = this.#controlsSubject.getValue().filter(existingControl => existingControl !== control);

    this.#controlsSubject.next(updatedControls);
  }

  #createValue(): Observable<Value[]> {
    const [value$, valueSubscription] = shareAndSubscribe(
      this.#controlsSubject.pipe(
        switchMap(controls => {
          return controls.length ? combineLatest(controls.map(control => control.value$)) : of([]);
        }),
        tap(value => this.#value = value),
      ),
    );
    this.addSubscription(valueSubscription);

    return value$;
  }

  #createDirty(): Observable<boolean> {
    const [dirty$, dirtySubscription] = shareAndSubscribe(
      this.#controlsSubject.pipe(
        switchMap(controls => {
          return controls.length ? combineLatest(controls.map(control => control.dirty$)) : of([false]);
        }),
        map(dirtyValues => dirtyValues.every(Boolean)),
        distinctUntilChanged(),
        tap(dirty => this.#dirty = dirty),
      ),
    );
    this.addSubscription(dirtySubscription);

    return dirty$;
  }

  #createTouched(): Observable<boolean> {
    const [touched$, touchedSubscription] = shareAndSubscribe(
      this.#controlsSubject.pipe(
        switchMap(controls => {
          return controls.length ? combineLatest(controls.map(control => control.touched$)) : of([false]);
        }),
        map(touchedValues => touchedValues.every(Boolean)),
        distinctUntilChanged(),
        tap(touched => this.#touched = touched),
      ),
    );
    this.addSubscription(touchedSubscription);

    return touched$;
  }

  #createError(): Observable<RxFormErrors<Array<Value>>> {
    const [error$, errorSubscription] = shareAndSubscribe(
      this.#controlsSubject.pipe(
        switchMap(controls => {
          return controls.length
            ? combineLatest(controls.map(control => control.error$ as Observable<RxFormControlError | RxFormErrors>))
            : of([null]);
        }),
        map(errorValues => errorValues.reduce<RxFormErrors<Array<Value>>>((errors, controlError, index) => {
          if (controlError !== null) {
            errors = (errors ?? {}) as NonNullable<RxFormErrors<Array<Value>>>;
            errors[index] = controlError as NonNullable<RxFormControlError>;
          }

          return errors;
        }, null)),
        tap(errors => this.#error = errors),
      ),
    );
    this.addSubscription(errorSubscription);

    return error$;
  }

  #createValid(): Observable<boolean> {
    const [valid$, validSubscription] = shareAndSubscribe(
      this.#controlsSubject.pipe(
        switchMap(controls => {
          return controls.length ? combineLatest(controls.map(control => control.valid$)) : of([true]);
        }),
        map(validValues => validValues.every(Boolean)),
        distinctUntilChanged(),
        tap(valid => this.#valid = valid),
      ),
    );
    this.addSubscription(validSubscription);

    return valid$;
  }
}
