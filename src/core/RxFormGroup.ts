import {
  asapScheduler,
  audit,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  scheduled,
  startWith,
  tap,
} from 'rxjs';
import { RxFormAbstractControl } from './RxFormAbstractControl';
import { RxFormControlError } from './RxFormControlError';
import { RxFormErrors } from './RxFormErrors';
import { shareAndSubscribe } from '../helpers';


export type ControlsMap<Group extends Record<string, any>, ControlName extends keyof Group> = {
  [P in ControlName]: RxFormAbstractControl<Group[P]>;
};

export type RxFormGroupState<Group> = {
  value: Group;
  dirty: boolean;
  touched: boolean;
  valid: boolean;
  error: RxFormErrors<Group>;
};

export class RxFormGroup<Group, ControlName extends keyof Group = keyof Group> extends RxFormAbstractControl<Group> {
  #initialValue: Group;
  #value: Group;
  #dirty: boolean;
  #touched: boolean;
  #valid: boolean;
  #error: RxFormErrors<Group>;

  readonly value$: Observable<Group>;
  readonly dirty$: Observable<boolean>;
  readonly touched$: Observable<boolean>;
  readonly valid$: Observable<boolean>;
  readonly error$: Observable<RxFormErrors<Group>>;
  readonly state$: Observable<RxFormGroupState<Group>>;
  readonly controls: Readonly<ControlsMap<Group, ControlName>>;

  constructor(controls: ControlsMap<Group, ControlName>) {
    super();

    const controlsEntries = Object.entries(controls) as Array<[ControlName, RxFormAbstractControl<Group[ControlName]>]>;
    this.controls = controls;

    this.value$ = this.#createValue(controlsEntries);
    this.dirty$ = this.#createDirty(controlsEntries);
    this.touched$ = this.#createTouched(controlsEntries);
    this.error$ = this.#createError(controlsEntries);
    this.valid$ = this.#createValid(controlsEntries);
    this.state$ = this.#createState();

    this.#initialValue = this.value;
    this.#value = this.value;
    this.#dirty = this.dirty;
    this.#touched = this.touched;
    this.#error = this.error;
    this.#valid = this.valid;
  }

  get value(): Group {
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

  get error(): RxFormErrors<Group> {
    return this.#error;
  }

  * controlsIterator(): IterableIterator<RxFormAbstractControl<Group[ControlName]>> {
    for (const control of Object.values(this.controls)) {
      yield control as RxFormAbstractControl<Group[ControlName]>;
    }
  }

  markAsTouched(): void {
    for (const control of this.controlsIterator()) {
      control.markAsTouched();
    }
  }

  markAsUntouched(): void {
    for (const control of this.controlsIterator()) {
      control.markAsUntouched();
    }
  }

  reset(initialValue?: Group): void {
    if (initialValue !== undefined) {
      this.#initialValue = initialValue;
    }

    for (const [controlName, controlValue] of Object.entries(this.#initialValue)) {
      this.controls[controlName as ControlName].reset(controlValue);
    }
  }

  setValue(value: Group): void {
    this.patchValue(value);
  }

  patchValue(value: Partial<Group>): void {
    for (const [controlName, controlValue] of Object.entries(value)) {
      this.controls[controlName as ControlName].setValue(controlValue);
    }
  }

  #createValue(entries: Array<[ControlName, RxFormAbstractControl<Group[ControlName]>]>): Observable<Group> {
    const [value$, valueSubscription] = shareAndSubscribe(
      combineLatest(entries.map(([controlName, control]) => {
        return control.value$.pipe(map(value => [controlName, value]));
      }))
        .pipe(
          map(entries => Object.fromEntries(entries) as Group),
          tap(value => this.#value = value),
        ),
    );
    this.addSubscription(valueSubscription);

    return value$;
  }

  #createDirty(entries: Array<[ControlName, RxFormAbstractControl<Group[ControlName]>]>): Observable<boolean> {
    const [dirty$, dirtySubscription] = shareAndSubscribe(
      combineLatest(entries.map(([, control]) => control.dirty$))
        .pipe(
          map(dirtyValues => dirtyValues.every(Boolean)),
          distinctUntilChanged(),
          tap(dirty => this.#dirty = dirty),
        ),
    );
    this.addSubscription(dirtySubscription);

    return dirty$;
  }

  #createTouched(entries: Array<[ControlName, RxFormAbstractControl<Group[ControlName]>]>): Observable<boolean> {
    const [touched$, touchedSubscription] = shareAndSubscribe(
      combineLatest(entries.map(([, control]) => control.touched$))
        .pipe(
          map(touchedValues => touchedValues.every(Boolean)),
          distinctUntilChanged(),
          tap(touched => this.#touched = touched),
        ),
    );
    this.addSubscription(touchedSubscription);

    return touched$;
  }

  #createError(entries: Array<[ControlName, RxFormAbstractControl<Group[ControlName]>]>): Observable<RxFormErrors<Group>> {
    const [error$, errorSubscription] = shareAndSubscribe(
      combineLatest(entries.map(([controlName, control]) => {
        return (control.error$ as Observable<RxFormControlError | RxFormErrors>).pipe(
          map(error => [controlName, error]));
      }))
        .pipe(
          map(errorValues => {
            const filteredEntries = errorValues.filter(([, error]) => error !== null);

            return filteredEntries.length ? Object.fromEntries(filteredEntries) as RxFormErrors<Group> : null;
          }),
          distinctUntilChanged(),
          tap(errors => this.#error = errors),
        ),
    );
    this.addSubscription(errorSubscription);

    return error$;
  }

  #createValid(entries: Array<[ControlName, RxFormAbstractControl<Group[ControlName]>]>): Observable<boolean> {
    const [valid$, validSubscription] = shareAndSubscribe(
      combineLatest(entries.map(([, control]) => control.valid$))
        .pipe(
          map(validValues => validValues.every(Boolean)),
          distinctUntilChanged(),
          tap(valid => this.#valid = valid),
        ),
    );
    this.addSubscription(validSubscription);

    return valid$;
  }

  #createState(): Observable<RxFormGroupState<Group>> {
    const [state$, stateSubscription] = shareAndSubscribe(
      combineLatest([
        this.value$, this.dirty$, this.touched$, this.valid$, this.error$,
      ]).pipe(
        audit(() => scheduled([null], asapScheduler)),
        map(([value, dirty, touched, valid, error]): RxFormGroupState<Group> => {
          return { value, dirty, touched, valid, error };
        }),
        startWith({
          value: this.value,
          dirty: this.dirty,
          touched: this.touched,
          valid: this.valid,
          error: this.error,
        }),
      ),
    );
    this.addSubscription(stateSubscription);

    return state$;
  }

}
