import { RxFormControl } from './RxFormControl';
import { RxFormControlAsyncValidator } from './RxFormControlAsyncValidator';
import { RxFormValidator } from './RxFormValidator';
import {RxFormGroup} from "./RxFormGroup";
import {RxFormArray} from "./RxFormArray";


export type RxFormControlValueOnlyInit<Value> = Value;

export type RxFormControlSingleValidatorInit<Value> = [Value, RxFormValidator<Value>?];

export type RxFormControlMultipleValidatorsInit<Value> = [Value, Array<RxFormValidator<Value>>];

export type RxFormControlBothValidatorsInit<Value> = [Value, RxFormValidator<Value>, RxFormControlAsyncValidator<Value>];

export type RxFormControlBothMultipleValidatorsInit<Value> = [Value, Array<RxFormValidator<Value>>, Array<RxFormControlAsyncValidator<Value>>];

export type RxFormControlInit<Value> =
  // RxFormControlValueOnlyInit<Value> |
  RxFormControlSingleValidatorInit<Value> |
  RxFormControlMultipleValidatorsInit<Value> |
  RxFormControlBothValidatorsInit<Value> |
  RxFormControlBothMultipleValidatorsInit<Value>;

export function createRxFormControl<Value>(controlInit: RxFormControlSingleValidatorInit<Value>): RxFormControl<Value>
export function createRxFormControl<Value>(controlInit: RxFormControlMultipleValidatorsInit<Value>): RxFormControl<Value>
export function createRxFormControl<Value>(controlInit: RxFormControlBothValidatorsInit<Value>): RxFormControl<Value>
export function createRxFormControl<Value>(controlInit: RxFormControlBothMultipleValidatorsInit<Value>): RxFormControl<Value>
export function createRxFormControl<Value>(value: RxFormControlValueOnlyInit<Value>): RxFormControl<Value>

export function createRxFormControl<Value>(controlInit: RxFormControlInit<Value>): RxFormControl<Value> {
  return new RxFormControl(...getRxFormControlArgs(controlInit)) as RxFormControl<Value>;
}

function getRxFormControlArgs<Value>(controlInit: RxFormControlInit<Value>): ConstructorParameters<typeof RxFormControl> {
  if (Array.isArray(controlInit) && controlInit.length) {
    const [value, validatorsInit, asyncValidatorsInit] = controlInit;
    const validators: Array<RxFormValidator<unknown>> = isValidatorsArray(validatorsInit)
      ? validatorsInit
      : (isValidator(validatorsInit) ? [validatorsInit] : []);
    const asyncValidators: Array<RxFormControlAsyncValidator<unknown>> = isValidatorsArray(asyncValidatorsInit)
      ? asyncValidatorsInit
      : (isValidator(asyncValidatorsInit) ? [asyncValidatorsInit] : []);

    return [value, validators, asyncValidators];
  }

  return [controlInit, [], []];
}

function isValidatorsArray(value: unknown): value is (Array<RxFormValidator<unknown>> & Array<RxFormControlAsyncValidator<unknown>>) {
  return Array.isArray(value);
}

function isValidator(value: unknown): value is (RxFormValidator<unknown> & RxFormControlAsyncValidator<unknown>) {
  return typeof value === 'function';
}
