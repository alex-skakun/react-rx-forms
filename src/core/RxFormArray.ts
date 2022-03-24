import { getCurrentFromObservable } from 'react-rx-tools';
import { BehaviorSubject, combineLatest, map, Observable, switchMap, tap } from 'rxjs';
import { RxFormAbstractControl } from './RxFormAbstractControl';
import { RxFormControlError } from './RxFormControlError';
import { RxFormErrors } from './RxFormErrors';


export type ControlsArray<ValueType, ControlType extends RxFormAbstractControl<ValueType> = RxFormAbstractControl<ValueType>> = Array<ControlType>;
type ControlsReadonlyArray<ValueType, ControlType extends RxFormAbstractControl<ValueType> = RxFormAbstractControl<ValueType>> = ReadonlyArray<ControlType>;

export class RxFormArray<ValueType, ControlType extends RxFormAbstractControl<ValueType> = RxFormAbstractControl<ValueType>> extends RxFormAbstractControl<Array<ValueType>> {
  readonly #controlsSubject: BehaviorSubject<ControlsArray<ValueType>>;
  #value: Array<ValueType>;
  #dirty: boolean;
  #touched: boolean;
  #valid: boolean;
  #error: RxFormErrors<Array<ValueType>>;

  readonly value$: Observable<Array<ValueType>>;
  readonly dirty$: Observable<boolean>;
  readonly touched$: Observable<boolean>;
  readonly valid$: Observable<boolean>;
  readonly error$: Observable<RxFormErrors<Array<ValueType>>>;

  constructor(controls: ControlsArray<ValueType>) {
    super();

    this.#controlsSubject = new BehaviorSubject(controls);

    this.value$ = this.#controlsSubject.pipe(
      switchMap(controls => combineLatest(controls.map(control => control.value$))),
      tap(value => this.#value = value)
    );
    this.#value = getCurrentFromObservable(this.value$)!;

    this.dirty$ = this.#controlsSubject.pipe(
      switchMap(controls => combineLatest(controls.map(control => control.dirty$))),
      map(dirtyValues => dirtyValues.every(Boolean)),
      tap(dirty => this.#dirty = dirty)
    );
    this.#dirty = getCurrentFromObservable(this.dirty$)!;

    this.touched$ = this.#controlsSubject.pipe(
      switchMap(controls => combineLatest(controls.map(control => control.touched$))),
      map(touchedValues => touchedValues.every(Boolean)),
      tap(touched => this.#touched = touched)
    );
    this.#touched = getCurrentFromObservable(this.touched$)!;

    this.valid$ = this.#controlsSubject.pipe(
      switchMap(controls => combineLatest(controls.map(control => control.valid$))),
      map(validValues => validValues.every(Boolean)),
      tap(valid => this.#valid = valid)
    );
    this.#valid = getCurrentFromObservable(this.valid$)!;

    this.error$ = this.#controlsSubject.pipe(
      switchMap(controls => combineLatest(controls.map(control => control.error$ as Observable<RxFormControlError | RxFormErrors>))),
      map(errorValues => errorValues.reduce<RxFormErrors<Array<ValueType>>>((errors, controlError, index) => {
        if (controlError !== null) {
          errors = (errors ?? {}) as NonNullable<RxFormErrors<Array<ValueType>>>;
          errors[index] = controlError as NonNullable<RxFormControlError>;
        }

        return errors;
      }, null)),
      tap(errors => this.#error = errors)
    );
    this.#error = getCurrentFromObservable(this.error$)!;
  }

  get value(): Array<ValueType> {
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

  get error(): RxFormErrors<Array<ValueType>> {
    return this.#error;
  }

  get controls(): ControlsReadonlyArray<ValueType> {
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

  setValue(value: Array<ValueType>): void {
    for (let [index, itemValue] of value.entries()) {
      this.getControlAt(index).setValue(itemValue);
    }
  }

  getControlAt(position: number): RxFormAbstractControl<ValueType> {
    return this.controls[position];
  }

  addControl(control: ControlType, position?: number): void {
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

  removeControl(control: ControlType): void {
    let updatedControls = this.#controlsSubject.getValue().filter(existingControl => existingControl !== control);

    this.#controlsSubject.next(updatedControls);
  }
}
