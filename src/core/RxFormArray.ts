import { getCurrentFromObservable } from 'react-rx-tools';
import { BehaviorSubject, combineLatest, map, Observable, switchMap, tap } from 'rxjs';
import { RxFormAbstractControl } from './RxFormAbstractControl';
import { RxFormControlError } from './RxFormControlError';
import { RxFormErrors } from './RxFormErrors';


export type ControlsArray<Value, Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>> = Array<Control>;
type ControlsReadonlyArray<Value, Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>> = ReadonlyArray<Control>;

export class RxFormArray<Value, Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>> extends RxFormAbstractControl<Array<Value>> {
  readonly #controlsSubject: BehaviorSubject<ControlsArray<Value>>;
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

  constructor(controls: ControlsArray<Value>) {
    super();

    this.#controlsSubject = new BehaviorSubject(controls);

    this.value$ = this.#controlsSubject.pipe(
      switchMap(controls => combineLatest(controls.map(control => control.value$))),
      tap(value => this.#value = value),
    );
    this.#value = getCurrentFromObservable(this.value$)!;

    this.dirty$ = this.#controlsSubject.pipe(
      switchMap(controls => combineLatest(controls.map(control => control.dirty$))),
      map(dirtyValues => dirtyValues.every(Boolean)),
      tap(dirty => this.#dirty = dirty),
    );
    this.#dirty = getCurrentFromObservable(this.dirty$)!;

    this.touched$ = this.#controlsSubject.pipe(
      switchMap(controls => combineLatest(controls.map(control => control.touched$))),
      map(touchedValues => touchedValues.every(Boolean)),
      tap(touched => this.#touched = touched),
    );
    this.#touched = getCurrentFromObservable(this.touched$)!;

    this.valid$ = this.#controlsSubject.pipe(
      switchMap(controls => combineLatest(controls.map(control => control.valid$))),
      map(validValues => validValues.every(Boolean)),
      tap(valid => this.#valid = valid),
    );
    this.#valid = getCurrentFromObservable(this.valid$)!;

    this.error$ = this.#controlsSubject.pipe(
      switchMap(controls => combineLatest(controls.map(control => control.error$ as Observable<RxFormControlError | RxFormErrors>))),
      map(errorValues => errorValues.reduce<RxFormErrors<Array<Value>>>((errors, controlError, index) => {
        if (controlError !== null) {
          errors = (errors ?? {}) as NonNullable<RxFormErrors<Array<Value>>>;
          errors[index] = controlError as NonNullable<RxFormControlError>;
        }

        return errors;
      }, null)),
      tap(errors => this.#error = errors),
    );
    this.#error = getCurrentFromObservable(this.error$)!;
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

  get controls(): ControlsReadonlyArray<Value> {
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
}
