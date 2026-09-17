import { catchError, defaultIfEmpty, defer, first, forkJoin, map, merge, Observable, of, race } from 'rxjs';
import { isEmptyArray, isPresent } from 'value-guards';
import { AsyncValidatorAbortReason } from './constants';
import type { RxFormAbstractControl } from './RxFormAbstractControl';
import type {
  AsyncValidatorsStrategy,
  RxFormAsyncValidator,
  RxFormAsyncValidatorResult,
  RxFormComposedAsyncValidators,
  RxFormErrors,
  RxFormValidatorResult,
} from './types';
import { defineFunctionWithProperties, newObservableWithAbort } from './utils';

export class AsyncValidators {

  static compose<
    Value,
    Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>,
    Validators extends RxFormAsyncValidator<Value, Control>[] = RxFormAsyncValidator<Value, Control>[]
  >(
    validators: Validators,
    strategy?: AsyncValidatorsStrategy,
  ): RxFormComposedAsyncValidators<Value, Control, Validators> {
    return defineFunctionWithProperties((control: Control): RxFormAsyncValidatorResult => {
      return AsyncValidators.validate(control, validators, strategy || 'race');
    }, {
      decompose: () => validators,
    });
  }

  static validate<Value, Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>>(
    control: Control,
    validators: RxFormAsyncValidator<Value, Control>[],
    strategy: AsyncValidatorsStrategy,
  ): RxFormAsyncValidatorResult {
    if (isEmptyArray(validators)) {
      return of(null);
    }

    switch (strategy) {
    case 'race':
      return AsyncValidators.#validateRaceStrategy(control, validators);
    case 'all':
      return AsyncValidators.#validateAllStrategy(control, validators);
    default:
      return of(null);
    }
  }

  static #validateRaceStrategy<Value, Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>>(
    control: Control,
    validators: RxFormAsyncValidator<Value, Control>[],
  ): Observable<RxFormErrors> {
    return newObservableWithAbort((subscriber, abortAfterValueChange$) => (
      race(
        validators.map((asyncValidator) => newObservableWithAbort<RxFormValidatorResult>((destination, abortAfterLostInRace$) => (
          defer(() => asyncValidator(control, merge(abortAfterValueChange$, abortAfterLostInRace$)))
            .pipe(
              first(),
              catchError((reason) => {
                if (reason === AsyncValidatorAbortReason.VALUE_CHANGED || reason === AsyncValidatorAbortReason.LOST_IN_RACE) {
                  return of(null);
                }

                return of({ asyncValidatorFailed: reason });
              }),
              defaultIfEmpty(null),
            )
            .subscribe(destination)
        ), AsyncValidatorAbortReason.LOST_IN_RACE)),
      )
        .pipe(
          first(),
          defaultIfEmpty(null),
        )
        .subscribe(subscriber)
    ), AsyncValidatorAbortReason.VALUE_CHANGED);
  }

  static #validateAllStrategy(asyncValidators: RxFormAsyncValidator<ValueType, typeof this>[]): Observable<RxFormErrors> {
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

}
