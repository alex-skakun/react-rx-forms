import { useMemo } from 'react';
import { createRxFormArray, RxFormAbstractControl, RxFormArray, RxFormArrayInit } from '../core';


export function useRxFormArray<Value, Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>>(
  formArrayInit: RxFormArrayInit<Value, Control>
): RxFormArray<Value, Control> {
  return useMemo(() => createRxFormArray(formArrayInit), []);
}
