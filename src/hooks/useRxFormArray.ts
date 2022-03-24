import { useMemo } from 'react';
import { ControlsArray, RxFormAbstractControl, RxFormArray, RxFormControl } from '../core';
import { createRxFormControl, RxFormControlInit } from './useRxFormControl';


type RxFormControlArrayInit<ValueType, ControlType extends RxFormAbstractControl<ValueType>> = Array<RxFormControl<ValueType> | RxFormControlInit<ValueType>>;
type RxFormAbstractArrayInit<ValueType, ControlType extends RxFormAbstractControl<ValueType>> = Array<ControlType>;

export type RxFormArrayInit<ValueType, ControlType extends RxFormAbstractControl<ValueType>> =
  RxFormAbstractArrayInit<ValueType, ControlType> | RxFormControlArrayInit<ValueType, ControlType>;

export function useRxFormArray<ValueType, ControlType extends RxFormAbstractControl<ValueType> = RxFormAbstractControl<ValueType>>(
  formArrayInit: RxFormArrayInit<ValueType, ControlType>
): RxFormArray<ValueType, ControlType> {
  return useMemo(() => createRxFormArray(formArrayInit), []);
}

export function createRxFormArray<ValueType, ControlType extends RxFormAbstractControl<ValueType> = RxFormAbstractControl<ValueType>>(
  formArrayInit: RxFormArrayInit<ValueType, ControlType>
): RxFormArray<ValueType, ControlType> {
  return new RxFormArray<ValueType, ControlType>(createControls(formArrayInit));
}

function createControls<ValueType, ControlType extends RxFormAbstractControl<ValueType> = RxFormAbstractControl<ValueType>>(
  formArrayInit: RxFormArrayInit<ValueType, ControlType>
): ControlsArray<ValueType, ControlType> {
  return formArrayInit.map(controlInit => {
    if (controlInit instanceof RxFormAbstractControl) {
      return controlInit as ControlType;
    } else {
      return createRxFormControl(controlInit) as unknown as ControlType;
    }
  });
}
