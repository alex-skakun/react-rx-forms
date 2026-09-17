import { distinctUntilRecordChanged } from 'react-rx-tools';
import {
  BehaviorSubject, catchError,
  combineLatest,
  debounce,
  defer,
  distinctUntilChanged,
  filter,
  finalize,
  first,
  forkJoin,
  from, fromEvent,
  map,
  merge,
  NEVER,
  Observable,
  of,
  race,
  sample,
  skip,
  startWith,
  Subject,
  Subscription,
  switchMap, takeUntil,
  tap,
  timer,
} from 'rxjs';
import { isEmptyInputValue, isNonNegativeSafeInteger, isPresent, Nullish } from 'value-guards';
import { ControlSampler, ControlTrigger, DEFAULT_ASYNC_VALIDATORS_DEBOUNCE_TIME } from './constants';
import { samplerTrigger } from './decorators';
import { SyncValidators } from './SyncValidators';
import {
  DISABLED_SAMPLERS,
  GET_SAMPLER,
  INIT_DISABLED_SOURCE,
  INIT_ERRORS_SOURCE,
  INIT_TOUCHED_SOURCE,
  INIT_VALUE_SOURCE,
  REMOVE_PARENT,
  SET_PARENT,
  TRIGGER_SAMPLER,
} from './tokens';
import type {
  AsyncValidatorsRunStrategy,
  AsyncValidatorsStrategy,
  InitialValue,
  RxFormAbstractControlOptions,
  RxFormAsyncValidator,
  RxFormControlState,
  RxFormErrors,
  RxFormSyncValidator,
  RxFormValidatorResult,
  SyncValidatorsStrategy,
} from './types';
import {
  addValidatorIntoCollection,
  newObservableWithAbort,
  normalizeControlValue,
  removeValidatorFromCollection,
  shareThroughSubject,
} from './utils';

export abstract class RxFormAbstractControl<const ValueType> {
  #parent: Nullish<RxFormAbstractControl<any>>;
  #subscription = Subscription.EMPTY;
  #touchedSource: Observable<boolean> = NEVER;
  readonly #syncValidatorsStrategy: SyncValidatorsStrategy;
  readonly #asyncValidatorsStrategy: AsyncValidatorsStrategy;
  readonly #asyncValidatorsRunStrategy: AsyncValidatorsRunStrategy;
  readonly #asyncValidatorsDebounceTime: number;
  readonly #asyncValidatorsBusy = new BehaviorSubject(false);
  readonly #syncValidatorsSubject: BehaviorSubject<RxFormSyncValidator<ValueType, RxFormAbstractControl<ValueType>>[]>;
  readonly #asyncValidatorsSubject: BehaviorSubject<RxFormAsyncValidator<ValueType, RxFormAbstractControl<ValueType>>[]>;
  readonly #valueShareSubject: BehaviorSubject<ValueType>;
  readonly #disabledShareSubject: BehaviorSubject<boolean>;
  readonly #touchedShareSubject: BehaviorSubject<boolean>;
  readonly #errorsShareSubject: BehaviorSubject<RxFormErrors>;
  readonly #dirtyShareSubject: BehaviorSubject<boolean>;
  readonly #validShareSubject: BehaviorSubject<boolean>;
  readonly #stateShareSubject: BehaviorSubject<RxFormControlState<ValueType>>;
  readonly #samplerSubject = new Subject<ControlSampler>();

  protected readonly [DISABLED_SAMPLERS] = new Set<ControlSampler>();

  readonly validating$ = this.#asyncValidatorsBusy.pipe(
    distinctUntilChanged(),
  );
  readonly value$: Observable<ValueType>;
  readonly disabled$: Observable<boolean>;
  readonly touched$: Observable<boolean>;
  readonly errors$: Observable<RxFormValidatorResult> | Observable<RxFormErrors>;
  readonly dirty$: Observable<boolean>;
  readonly valid$: Observable<boolean>;
  readonly state$: Observable<RxFormControlState<ValueType>>;

  protected constructor(
    initialValue: InitialValue<ValueType> = null,
    {
      disabled: initialDisabled = false,
      touched: initialTouched = false,
      syncValidators = [],
      asyncValidators = [],
      syncValidatorsStrategy = 'first',
      asyncValidatorsStrategy = 'race',
      asyncValidatorsRunStrategy = 'if-sync-valid',
      asyncValidatorsDebounceTime,
    }: RxFormAbstractControlOptions<NoInfer<ValueType>, RxFormAbstractControl<ValueType>> = {},
  ) {
    const normalizedInitialValue = normalizeControlValue(initialValue) as ValueType;
    const initialDirty = !isEmptyInputValue(normalizedInitialValue);
    const initialErrors = SyncValidators.validate(this, syncValidators, syncValidatorsStrategy);
    const initialValid = !initialErrors;

    this.#syncValidatorsStrategy = syncValidatorsStrategy;
    this.#asyncValidatorsStrategy = asyncValidatorsStrategy;
    this.#asyncValidatorsRunStrategy = asyncValidatorsRunStrategy;
    this.#asyncValidatorsDebounceTime = isNonNegativeSafeInteger(asyncValidatorsDebounceTime)
      ? asyncValidatorsDebounceTime
      : DEFAULT_ASYNC_VALIDATORS_DEBOUNCE_TIME;
    this.#syncValidatorsSubject = new BehaviorSubject(syncValidators);
    this.#asyncValidatorsSubject = new BehaviorSubject(asyncValidators);
    this.#valueShareSubject = new BehaviorSubject(normalizedInitialValue);
    this.#disabledShareSubject = new BehaviorSubject(initialDisabled);
    this.#touchedShareSubject = new BehaviorSubject(initialTouched);
    this.#errorsShareSubject = new BehaviorSubject(initialErrors);
    this.#dirtyShareSubject = new BehaviorSubject(initialDirty);
    this.#validShareSubject = new BehaviorSubject(initialValid);
    this.#stateShareSubject = new BehaviorSubject({
      value: this.value,
      disabled: this.disabled,
      touched: this.touched,
      errors: this.errors,
      dirty: this.dirty,
      valid: this.valid,
    });

    this.value$ = this.#createValue(normalizedInitialValue, this.#valueShareSubject);
    this.disabled$ = this.#createDisabled(initialDisabled, this.#disabledShareSubject);
    this.touched$ = this.#createTouched(initialTouched, this.#touchedShareSubject);
    this.errors$ = this.#createError(this.#errorsShareSubject);
    this.dirty$ = this.#createDirty(this.#dirtyShareSubject);
    this.valid$ = this.#createValid(this.#validShareSubject);
    this.state$ = this.#createState(this.#stateShareSubject);

    this.start();
  }

  get value(): ValueType {
    return this.#valueShareSubject.getValue();
  }

  get disabled(): boolean {
    return this.#disabledShareSubject.getValue();
  }

  get touched(): boolean {
    return this.#touchedShareSubject.getValue();
  }

  get errors(): RxFormErrors | null {
    return this.#errorsShareSubject.getValue();
  }

  get dirty(): boolean {
    return this.#dirtyShareSubject.getValue();
  }

  get valid(): boolean {
    return this.#validShareSubject.getValue();
  }

  get state(): RxFormControlState<ValueType> {
    return this.#stateShareSubject.getValue();
  }

  abstract reset(initialValue?: InitialValue<ValueType>): void;

  abstract setValue(value: InitialValue<ValueType>): this;

  abstract disable(): this;

  abstract enable(): this;

  abstract markAsTouched(): this;

  abstract markAsUntouched(): this;

  protected abstract [INIT_VALUE_SOURCE](initialValue: InitialValue<ValueType>): Observable<InitialValue<ValueType>>;

  protected abstract [INIT_DISABLED_SOURCE](initialDisabled: boolean): Observable<boolean>;

  protected abstract [INIT_TOUCHED_SOURCE](initialTouched: boolean): Observable<boolean>;

  protected abstract [INIT_ERRORS_SOURCE](validatorsResult$: Observable<RxFormErrors>): Observable<RxFormErrors>;

  protected [GET_SAMPLER]<const SamplerName extends ControlSampler>(samplerName: SamplerName): Observable<SamplerName> {
    return this.#samplerSubject.pipe(
      filter((value): value is SamplerName => value === samplerName),
      filter(() => !this[DISABLED_SAMPLERS].has(samplerName)),
    );
  }

  protected [TRIGGER_SAMPLER](inSelf: ControlSampler[], inParent?: ControlSampler[]): void {
    inSelf.forEach((sampler) => this.#samplerSubject.next(sampler));

    if (this.#parent && Array.isArray(inParent)) {
      this.#parent[TRIGGER_SAMPLER](inParent, inParent);
    }
  }

  protected [SET_PARENT](parent: RxFormAbstractControl<any>): void {
    this.#parent = parent;
  }

  protected [REMOVE_PARENT](): void {
    this.#parent = null;
  }

  @samplerTrigger({ trigger: ControlTrigger.VALIDATORS })
  addSyncValidator(syncValidator: RxFormSyncValidator<ValueType, typeof this | RxFormAbstractControl<ValueType>>): this {
    addValidatorIntoCollection(this.#syncValidatorsSubject, syncValidator);

    return this;
  }

  @samplerTrigger({ trigger: ControlTrigger.VALIDATORS })
  removeSyncValidator(syncValidator: RxFormSyncValidator<ValueType, typeof this | RxFormAbstractControl<ValueType>>): this {
    removeValidatorFromCollection(this.#syncValidatorsSubject, syncValidator);

    return this;
  }

  @samplerTrigger({ trigger: ControlTrigger.VALIDATORS })
  addAsyncValidator(asyncValidator: RxFormAsyncValidator<ValueType, typeof this | RxFormAbstractControl<ValueType>>): this {
    addValidatorIntoCollection(this.#asyncValidatorsSubject, asyncValidator);

    return this;
  }

  @samplerTrigger({ trigger: ControlTrigger.VALIDATORS })
  removeAsyncValidator(asyncValidator: RxFormAsyncValidator<ValueType, typeof this | RxFormAbstractControl<ValueType>>): this {
    removeValidatorFromCollection(this.#asyncValidatorsSubject, asyncValidator);

    return this;
  }

  start(): this {
    if (this.#subscription === Subscription.EMPTY) {
      this.#subscription = this.state$.subscribe();
      this[TRIGGER_SAMPLER]([ControlSampler.STATE]);
    }

    return this;
  }

  destroy(): this {
    this.#subscription.unsubscribe();
    this.#subscription = Subscription.EMPTY;

    return this;
  }

  #createValue(
    initialValue: InitialValue<ValueType>,
    shareSubject: BehaviorSubject<ValueType>,
  ): Observable<ValueType> {
    return this[INIT_VALUE_SOURCE](initialValue).pipe(
      startWith(initialValue),
      map((value) => normalizeControlValue(value) as ValueType),
      distinctUntilChanged(),
      shareThroughSubject(shareSubject),
    );
  }

  #createDisabled(
    initialDisabled: boolean,
    shareSubject: BehaviorSubject<boolean>,
  ): Observable<boolean> {
    return this[INIT_DISABLED_SOURCE](initialDisabled).pipe(
      startWith(initialDisabled),
      distinctUntilChanged(),
      shareThroughSubject(shareSubject),
    );
  }

  #createTouched(
    initialTouched: boolean,
    shareSubject: BehaviorSubject<boolean>,
  ): Observable<boolean> {
    this.#touchedSource = this[INIT_TOUCHED_SOURCE](initialTouched);

    return this.#touchedSource.pipe(
      startWith(initialTouched),
      distinctUntilChanged(),
      shareThroughSubject(shareSubject),
    );
  }

  #createError(
    shareSubject: BehaviorSubject<RxFormErrors>,
  ): Observable<RxFormValidatorResult> {
    const validatorsResult$ = this.value$.pipe(
      switchMap((_value, index) => this.#syncValidatorsSubject.pipe(
        map((syncValidators) => ({
          syncValidatorsResult: SyncValidators.validate(this, syncValidators, this.#syncValidatorsStrategy),
          firstTime: !index,
        })),
      )),
      switchMap(({ syncValidatorsResult, firstTime }) => this.#asyncValidatorsSubject.pipe(
        switchMap((asyncValidators) => (
          this.#shouldRunAsyncValidators(asyncValidators, syncValidatorsResult)
            ? of(null).pipe(
              tap(() => this.#asyncValidatorsBusy.next(true)),
              debounce(() => (
                firstTime ? of(null) : merge(
                  timer(this.#asyncValidatorsDebounceTime),
                  this.#touchedSource.pipe(
                    skip(1),
                    filter(Boolean),
                  ),
                )
              )),
              switchMap(() => this.#runAsyncValidators(asyncValidators)),
              map((asyncValidatorsResult) => ({
                ...syncValidatorsResult,
                ...asyncValidatorsResult,
              })),
              finalize(() => {
                Promise.resolve().then(() => {
                  this.#asyncValidatorsBusy.next(false);
                  this[TRIGGER_SAMPLER]([ControlSampler.STATE]);
                });
              }),
            )
            : of(syncValidatorsResult)
        )),
        startWith(syncValidatorsResult),
      )),
    );

    return this[INIT_ERRORS_SOURCE](validatorsResult$).pipe(
      distinctUntilChanged(),
      shareThroughSubject(shareSubject),
    );
  }

  #createDirty(shareSubject: BehaviorSubject<boolean>): Observable<boolean> {
    return this.value$.pipe(
      map((value) => !isEmptyInputValue(value)),
      distinctUntilChanged(),
      shareThroughSubject(shareSubject),
    );
  }

  #createValid(shareSubject: BehaviorSubject<boolean>): Observable<boolean> {
    return this.errors$.pipe(
      map((errors) => !errors),
      distinctUntilChanged(),
      shareThroughSubject(shareSubject),
    );
  }

  #createState(shareSubject: BehaviorSubject<RxFormControlState<ValueType>>) {
    return combineLatest([
      this.value$,
      this.disabled$,
      this.touched$,
      this.errors$,
      this.dirty$,
      this.valid$,
    ]).pipe(
      sample(this[GET_SAMPLER](ControlSampler.STATE)),
      map(([value, disabled, touched, errors, dirty, valid]): RxFormControlState<ValueType> => ({
        value,
        disabled,
        touched,
        errors,
        dirty,
        valid,
      })),
      distinctUntilRecordChanged(),
      shareThroughSubject(shareSubject),
    );
  }

  #runAsyncValidators(asyncValidators: RxFormAsyncValidator<ValueType, typeof this>[]): Observable<RxFormErrors> {
    if (!asyncValidators.length) {
      return of(null);
    }

    switch (this.#asyncValidatorsStrategy) {
    case 'race':
      return this.#runAsyncValidatorsRaceStrategy(asyncValidators);
    case 'all':
      return this.#runAsyncValidatorsAllStrategy(asyncValidators);
    }
  }

  #runAsyncValidatorsRaceStrategy(asyncValidators: RxFormAsyncValidator<ValueType, typeof this>[]): Observable<RxFormErrors> {
    return new Observable((destination) => {
      const abortController = new AbortController();

      race(
        asyncValidators.map((asyncValidator) => newObservableWithAbort<RxFormErrors>((subscriber, signal) => {
          const ownSignal = AbortSignal.any([signal, abortController.signal]);

          return defer(() => asyncValidator(this, ownSignal))
            .pipe(
              first(),
              catchError((error) => {

              }),
            )
            .subscribe(subscriber);
        })),
      )
        .pipe(
          takeUntil(fromEvent(abortController.signal, 'abort')),
        )
        .subscribe(destination);


      return () => {
        if (!abortController.signal.aborted) {
          abortController.abort();
        }
      };
    });
  }

  #runAsyncValidatorsAllStrategy(asyncValidators: RxFormAsyncValidator<ValueType, typeof this>[]): Observable<RxFormErrors> {
    return forkJoin(
      asyncValidators.map((asyncValidator) => (
        defer(() => asyncValidator(this)).pipe(first())
      )),
    ).pipe(
      map((results) => results.filter(isPresent)),
      map((filteredResults) => (
        filteredResults.length ? Object.assign({}, ...filteredResults) : null
      )),
    );
  }

  #shouldRunAsyncValidators(
    asyncValidators: RxFormAsyncValidator<ValueType, typeof this>[],
    syncValidatorsResult: RxFormErrors,
  ): boolean {
    if (!asyncValidators.length) {
      return false;
    }

    switch (this.#asyncValidatorsRunStrategy) {
    case 'always':
      return true;
    case 'if-sync-valid':
      return !syncValidatorsResult;
    }
  }
}
