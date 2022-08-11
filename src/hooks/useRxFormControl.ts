import { useEffect } from 'react';
import { useOnce } from 'react-cool-hooks';
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


export function useRxFormControl<Value>(controlInit: RxFormControlSingleValidatorInit<Value>): RxFormControl<Value>
export function useRxFormControl<Value>(controlInit: RxFormControlMultipleValidatorsInit<Value>): RxFormControl<Value>
export function useRxFormControl<Value>(controlInit: RxFormControlBothValidatorsInit<Value>): RxFormControl<Value>
export function useRxFormControl<Value>(controlInit: RxFormControlBothMultipleValidatorsInit<Value>): RxFormControl<Value>
export function useRxFormControl<Value>(value: RxFormControlValueOnlyInit<Value>): RxFormControl<Value>

export function useRxFormControl<Value>(controlInit: RxFormControlInit<Value>): RxFormControl<Value> {
  const formControl = useOnce(() => {
    return createRxFormControl<Value>(controlInit as RxFormControlBothMultipleValidatorsInit<Value>);
  });

  useEffect(() => () => {
    formControl.destroy();
  }, []);

  return formControl;
}
