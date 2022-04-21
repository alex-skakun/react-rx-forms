import { useMemo } from 'react';
import {
  createRxFormControl,
  RxFormControl,
  RxFormControlBothMultipleValidatorsInit,
  RxFormControlBothValidatorsInit,
  RxFormControlInit,
  RxFormControlMultipleValidatorsInit,
  RxFormControlSingleValidatorInit,
  RxFormControlValueOnlyInit,
} from '../core';


export function useRxFormControl<Value>(value: RxFormControlValueOnlyInit<Value>): RxFormControl<Value>
export function useRxFormControl<Value>(controlInit: RxFormControlSingleValidatorInit<Value>): RxFormControl<Value>
export function useRxFormControl<Value>(controlInit: RxFormControlMultipleValidatorsInit<Value>): RxFormControl<Value>
export function useRxFormControl<Value>(controlInit: RxFormControlBothValidatorsInit<Value>): RxFormControl<Value>
export function useRxFormControl<Value>(controlInit: RxFormControlBothMultipleValidatorsInit<Value>): RxFormControl<Value>

export function useRxFormControl<Value>(controlInit: RxFormControlInit<Value>): RxFormControl<Value> {
  return useMemo(() => createRxFormControl<Value>(controlInit as RxFormControlBothMultipleValidatorsInit<Value>), []);
}
