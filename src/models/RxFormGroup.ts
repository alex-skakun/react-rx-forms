import { getCurrentFromObservable } from 'react-rx-tools';
import { asyncScheduler, audit, combineLatest, map, Observable, scheduled, tap } from 'rxjs';
import { RxFormAbstractControl } from './RxFormAbstractControl';
import { RxFormControlError } from './RxFormControlError';
import { RxFormErrors } from './RxFormErrors';


export type RxFormGroupControls<GroupType, FieldName extends keyof GroupType = keyof GroupType> = {
  [Property in FieldName]: RxFormAbstractControl<GroupType[Property]>
};

export type RxFormGroupState<GroupType> = {
  value: GroupType;
  dirty: boolean;
  touched: boolean;
  valid: boolean;
  error: RxFormErrors<GroupType>;
};

export class RxFormGroup<GroupType, FieldName extends keyof GroupType = keyof GroupType> extends RxFormAbstractControl<GroupType> {
  #initialValue: GroupType;
  #value: GroupType;
  #dirty: boolean;
  #touched: boolean;
  #valid: boolean;
  #error: RxFormErrors<GroupType>;

  readonly value$: Observable<GroupType>;
  readonly dirty$: Observable<boolean>;
  readonly touched$: Observable<boolean>;
  readonly valid$: Observable<boolean>;
  readonly error$: Observable<RxFormErrors<GroupType>>;
  readonly state$: Observable<RxFormGroupState<GroupType>>;
  readonly controls: Readonly<RxFormGroupControls<GroupType>>;

  constructor(controls: RxFormGroupControls<GroupType>) {
    super();

    this.controls = controls;
    const controlsEntries = Object.entries(controls) as Array<[FieldName, RxFormAbstractControl<GroupType[FieldName]>]>;

    this.value$ = combineLatest(controlsEntries.map(([controlName, control]) => {
      return control.value$.pipe(map(value => [controlName, value]));
    }))
      .pipe(
        map(entries => Object.fromEntries(entries) as GroupType),
        tap(value => this.#value = value)
      );
    this.#value = getCurrentFromObservable(this.value$)!;
    this.#initialValue = this.#value;

    this.dirty$ = combineLatest(controlsEntries.map(([, control]) => control.dirty$))
      .pipe(
        map(dirtyValues => dirtyValues.every(Boolean)),
        tap(dirty => this.#dirty = dirty)
      );
    this.#dirty = getCurrentFromObservable(this.dirty$)!;

    this.touched$ = combineLatest(controlsEntries.map(([, control]) => control.touched$))
      .pipe(
        map(touchedValues => touchedValues.every(Boolean)),
        tap(touched => this.#touched = touched)
      );
    this.#touched = getCurrentFromObservable(this.touched$)!;

    this.valid$ = combineLatest(controlsEntries.map(([, control]) => control.valid$))
      .pipe(
        map(validValues => validValues.every(Boolean)),
        tap(valid => this.#valid = valid)
      );
    this.#valid = getCurrentFromObservable(this.valid$)!;

    this.error$ = combineLatest(controlsEntries.map(([controlName, control]) => {
      return (control.error$ as Observable<RxFormControlError | RxFormErrors>).pipe(map(error => [controlName, error]));
    }))
      .pipe(
        map(errorValues => {
          let filteredEntries = errorValues.filter(([, error]) => error !== null);

          return filteredEntries.length ? Object.fromEntries(filteredEntries) as RxFormErrors<GroupType> : null;
        }),
        tap(errors => this.#error = errors)
      );
    this.#error = getCurrentFromObservable(this.error$)!;

    this.state$ = combineLatest([
      this.value$, this.dirty$, this.touched$, this.valid$, this.error$
    ]).pipe(
      audit(() => scheduled([], asyncScheduler)),
      map(([value, dirty, touched, valid, error]): RxFormGroupState<GroupType> => ({
        value, dirty, touched, valid, error
      }))
    );
  }

  get value(): GroupType {
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

  get error(): RxFormErrors<GroupType> {
    return this.#error;
  }

  * controlsIterator(): IterableIterator<RxFormAbstractControl<GroupType[FieldName]>> {
    for (let control of Object.values(this.controls)) {
      yield control as RxFormAbstractControl<GroupType[FieldName]>;
    }
  }

  markAsTouched(): void {
    for (let control of this.controlsIterator()) {
      control.markAsTouched();
    }
  }

  markAsUntouched(): void {
    for (let control of this.controlsIterator()) {
      control.markAsUntouched();
    }
  }

  reset(initialValue?: GroupType): void {
    if (initialValue !== undefined) {
      this.#initialValue = initialValue;
    }

    for (let [controlName, controlValue] of Object.entries(this.#initialValue)) {
      this.controls[controlName as FieldName].reset(controlValue as GroupType[FieldName]);
    }
  }

  setValue(value: GroupType): void {
    this.patchValue(value);
  }

  patchValue(value: Partial<GroupType>): void {
    for (let [controlName, controlValue] of Object.entries(value)) {
      this.controls[controlName as FieldName].setValue(controlValue as GroupType[FieldName]);
    }
  }
}
