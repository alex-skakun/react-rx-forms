import { isEmptyArray } from 'value-guards';
import type { RxFormAbstractControl } from './RxFormAbstractControl';
import type {
  RxFormComposedSyncValidator,
  RxFormErrors,
  RxFormSyncValidator,
  RxFormValidatorResult,
  SyncValidatorsStrategy,
} from './types';
import { defineFunctionWithProperties } from './utils';

export class SyncValidators {

  static compose<
    Value,
    Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>,
    Validators extends RxFormSyncValidator<Value, Control>[] = RxFormSyncValidator<Value, Control>[]
  >(
    validators: Validators,
    strategy?: SyncValidatorsStrategy,
  ): RxFormComposedSyncValidator<Value, Control, Validators> {
    return defineFunctionWithProperties((control: Control): RxFormValidatorResult => {
      return SyncValidators.validate(control, validators, strategy || 'first');
    }, {
      decompose: () => validators,
    });
  }

  static validate<Value, Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>>(
    control: Control,
    validators: RxFormSyncValidator<Value, Control>[],
    strategy: SyncValidatorsStrategy,
  ) {
    if (isEmptyArray(validators)) {
      return null;
    }

    switch (strategy) {
    case 'first':
      return SyncValidators.#validateFirstStrategy(control, validators);
    case 'all':
      return SyncValidators.#validateAllStrategy(control, validators);
    default:
      return null;
    }
  }

  static #validateFirstStrategy<Value, Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>>(
    control: Control,
    validators: RxFormSyncValidator<Value, Control>[],
  ): RxFormValidatorResult {
    for (const syncValidator of validators) {
      const validatorResult = syncValidator(control);

      if (validatorResult) {
        return validatorResult;
      }
    }

    return null;
  }

  static #validateAllStrategy<Value, Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>>(
    control: Control,
    validators: RxFormSyncValidator<Value, Control>[],
  ): RxFormValidatorResult {
    return validators.reduce<RxFormErrors>((errors, syncValidator) => {
      const validatorResult = syncValidator(control);

      if (validatorResult) {
        return Object.assign(errors ?? {}, validatorResult);
      }

      return errors;
    }, null);
  }
}
