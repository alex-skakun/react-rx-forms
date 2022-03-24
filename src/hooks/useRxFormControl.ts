import { useMemo } from 'react';
import { RxFormControl, RxFormControlAsyncValidator, RxFormControlValidator } from '../core';


type RxFormControlValueOnlyInit<ValueType> = ValueType;

type RxFormControlSingleValidatorInit<ValueType> = [ValueType, RxFormControlValidator<ValueType>?];

type RxFormControlMultipleValidatorsInit<ValueType> = [ValueType, Array<RxFormControlValidator<ValueType>>];

type RxFormControlBothValidatorsInit<ValueType> = [ValueType, RxFormControlValidator<ValueType>, RxFormControlAsyncValidator<ValueType>];

type RxFormControlBothMultipleValidatorsInit<ValueType> = [
  ValueType,
  Array<RxFormControlValidator<ValueType>>,
  Array<RxFormControlAsyncValidator<ValueType>>
];

export type RxFormControlInit<ValueType> =
  RxFormControlValueOnlyInit<ValueType> |
  RxFormControlSingleValidatorInit<ValueType> |
  RxFormControlMultipleValidatorsInit<ValueType> |
  RxFormControlBothValidatorsInit<ValueType> |
  RxFormControlBothMultipleValidatorsInit<ValueType>;

export function useRxFormControl<ValueType>(value: RxFormControlValueOnlyInit<ValueType>): RxFormControl<ValueType>
export function useRxFormControl<ValueType>(controlInit: RxFormControlSingleValidatorInit<ValueType>): RxFormControl<ValueType>
export function useRxFormControl<ValueType>(controlInit: RxFormControlMultipleValidatorsInit<ValueType>): RxFormControl<ValueType>
export function useRxFormControl<ValueType>(controlInit: RxFormControlBothValidatorsInit<ValueType>): RxFormControl<ValueType>
export function useRxFormControl<ValueType>(controlInit: RxFormControlBothMultipleValidatorsInit<ValueType>): RxFormControl<ValueType>

export function useRxFormControl<ValueType>(controlInit: RxFormControlInit<ValueType>): RxFormControl<ValueType> {
  return useMemo(() => createRxFormControl(controlInit), []);
}

export function createRxFormControl<ValueType>(controlInit: RxFormControlInit<ValueType>): RxFormControl<ValueType> {
  return new RxFormControl(...getRxFormControlArgs(controlInit)) as RxFormControl<ValueType>;
}

function getRxFormControlArgs<ValueType>(controlInit: RxFormControlInit<ValueType>): ConstructorParameters<typeof RxFormControl> {
  if (Array.isArray(controlInit) && controlInit.length) {
    let [value, validatorsInit, asyncValidatorsInit] = controlInit;
    let validators: Array<RxFormControlValidator<unknown>> = isValidatorsArray(validatorsInit)
      ? validatorsInit
      : (isValidator(validatorsInit) ? [validatorsInit] : []);
    let asyncValidators: Array<RxFormControlAsyncValidator<unknown>> = isValidatorsArray(asyncValidatorsInit)
      ? asyncValidatorsInit
      : (isValidator(asyncValidatorsInit) ? [asyncValidatorsInit] : []);

    return [value, validators, asyncValidators];
  }

  return [controlInit, [], []];
}

function isValidatorsArray(value: unknown): value is (Array<RxFormControlValidator<unknown>> & Array<RxFormControlAsyncValidator<unknown>>) {
  return Array.isArray(value);
}

function isValidator(value: unknown): value is (RxFormControlValidator<unknown> & RxFormControlAsyncValidator<unknown>) {
  return typeof value === 'function';
}
