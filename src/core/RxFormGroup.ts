import { objectEntries } from 'react-cool-utils';
import { distinctUntilRecordChanged } from 'react-rx-tools';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, sample, switchMap } from 'rxjs';
import { isFunction } from 'value-guards';
import { ControlSampler, ControlTrigger } from './constants';
import { samplerTrigger } from './decorators';
import { RxFormAbstractControl } from './RxFormAbstractControl';
import { GET_SAMPLER, INIT_DISABLED_SOURCE, INIT_ERRORS_SOURCE, INIT_TOUCHED_SOURCE, INIT_VALUE_SOURCE, SET_PARENT } from './tokens';
import { type RxFormAbstractControlOptions, RxFormErrors, ValueOfControl } from './types';
import { createObjectFromEntries } from './utils';

export type ControlsRecord = Record<string, RxFormAbstractControl<any>>;
export type ControlsMap = Map<string, RxFormAbstractControl<unknown>>;
export type GroupValue<Controls extends ControlsRecord> = {
  [P in keyof Controls]: ValueOfControl<Controls[P]>;
}

export class RxFormGroup<
  const Controls extends ControlsRecord
> extends RxFormAbstractControl<GroupValue<Controls>> {
  readonly #controlsMapSubject: BehaviorSubject<ControlsMap>;
  #initialValue: GroupValue<Controls>;

  constructor(
    controls?: Controls,
    options?: RxFormAbstractControlOptions<NoInfer<GroupValue<Controls>>>,
  ) {
    const controlsMap = new Map(controls ? objectEntries(controls) : []);
    const initialValue = controlsMap.entries().reduce((value, [controlName, control]) => {
      Reflect.set(value, controlName, control.value);
      return value;
    }, {} as GroupValue<Controls>);

    super(initialValue, options);

    this.#controlsMapSubject = new BehaviorSubject(controlsMap);
    this.#initialValue = initialValue;

    for (const control of this) {
      control[SET_PARENT](this);
    }
  }

  get #controlsMap(): ControlsMap {
    return this.#controlsMapSubject.getValue();
  }

  getControl<const ControlName extends keyof Controls>(controlName: ControlName): Controls[ControlName] {
    return this.#controlsMap.get(controlName as string) as Controls[ControlName];
  }

  @samplerTrigger({
    trigger: ControlTrigger.VALUE,
    override: [],
  })
  reset(initialValue?: GroupValue<Controls>): void {
    this.#initialValue = initialValue ?? this.#initialValue;

    for (const [controlName, control] of this.controlEntries()) {
      control.reset(this.#initialValue[controlName]);
    }
  }

  @samplerTrigger({
    trigger: ControlTrigger.VALUE,
    override: [],
  })
  setValue(value: GroupValue<Controls>): this {
    for (const [controlName, control] of this.controlEntries()) {
      control.setValue(value[controlName]);
    }

    return this;
  }

  @samplerTrigger({
    trigger: ControlTrigger.VALUE,
    override: [],
  })
  patchValue(patch: Partial<GroupValue<Controls>>): this {
    const currentControls = this.#controlsMap;

    for (const [controlName, controlValue] of objectEntries(patch)) {
      currentControls.get(controlName as string)?.setValue(controlValue);
    }

    return this;
  }

  @samplerTrigger({
    trigger: ControlTrigger.DISABLED,
    override: [],
  })
  disable(): this {
    for (const control of this) {
      control.disable();
    }

    return this;
  }

  @samplerTrigger({
    trigger: ControlTrigger.DISABLED,
    override: [],
  })
  enable(): this {
    for (const control of this) {
      control.enable();
    }

    return this;
  }

  @samplerTrigger({
    trigger: ControlTrigger.TOUCHED,
    override: [],
  })
  markAsTouched(): this {
    for (const control of this) {
      control.markAsTouched();
    }

    return this;
  }

  @samplerTrigger({
    trigger: ControlTrigger.TOUCHED,
    override: [],
  })
  markAsUntouched(): this {
    for (const control of this) {
      control.markAsUntouched();
    }

    return this;
  }

  controlEntries<Result>(mapFn: (control: RxFormAbstractControl<unknown>, controlName: string) => Result): Generator<Result, void, void>;
  controlEntries(): Generator<[string, RxFormAbstractControl<unknown>], void, void>;

  * controlEntries<Result = [string, RxFormAbstractControl<unknown>]>(
    mapFn?: (control: RxFormAbstractControl<unknown>, controlName: string) => Result,
  ): Generator<Result, void, void> {
    for (const entry of this.#controlsMap) {
      if (isFunction(mapFn)) {
        yield mapFn(entry[1], entry[0]);
      }

      yield entry as Result;
    }
  }

  * [Symbol.iterator](): Generator<RxFormAbstractControl<unknown>, void, void> {
    yield* this.#controlsMap.values();
  }

  protected [INIT_VALUE_SOURCE](): Observable<GroupValue<Controls>> {
    return this.#controlsMapSubject.pipe(
      switchMap((controlsMap) => combineLatest(
        createObjectFromEntries(controlsMap, ({ value$ }) => value$),
      ) as Observable<GroupValue<Controls>>),
      sample(this[GET_SAMPLER](ControlSampler.VALUE)),
      distinctUntilRecordChanged(),
    );
  }

  protected [INIT_DISABLED_SOURCE](): Observable<boolean> {
    return this.#controlsMapSubject.pipe(
      switchMap((controlsMap) => combineLatest(
        Array.from(controlsMap.values(), ({ disabled$ }) => disabled$),
      )),
      sample(this[GET_SAMPLER](ControlSampler.DISABLED)),
      map((statuses) => statuses.every(Boolean)),
      distinctUntilChanged(),
    );
  }

  protected [INIT_TOUCHED_SOURCE](): Observable<boolean> {
    return this.#controlsMapSubject.pipe(
      switchMap((controlsMap) => combineLatest(
        Array.from(controlsMap.values(), ({ touched$ }) => touched$),
      )),
      sample(this[GET_SAMPLER](ControlSampler.TOUCHED)),
      map((statuses) => statuses.some(Boolean)),
      distinctUntilChanged(),
    );
  }

  protected [INIT_ERRORS_SOURCE](validatorsResult$: Observable<RxFormErrors>): Observable<RxFormErrors> {
    return combineLatest({
      validatorsResult: validatorsResult$,
      controlsErrors: combineLatest(
        Object.fromEntries(this.controlEntries(({ errors$ }, controlName) => [controlName, errors$])),
      ).pipe(
        map((controlsErrors) => collectControlsErrors(controlsErrors)),
        distinctUntilChanged(),
      ),
    }).pipe(
      map(({ validatorsResult, controlsErrors }) => (
        validatorsResult || controlsErrors
          ? { ...validatorsResult, controlsErrors }
          : null
      )),
      distinctUntilChanged(),
    );
  }
}

function collectControlsErrors(rawErrors: NonNullable<RxFormErrors>): RxFormErrors {
  let errors = null;

  for (const [controlName, possibleError] of objectEntries(rawErrors)) {
    if (possibleError) {
      errors = Object.assign(errors || {}, {
        [controlName]: possibleError,
      });
    }
  }

  return errors;
}
