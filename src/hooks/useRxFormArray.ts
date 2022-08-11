import { useEffect } from 'react';
import { useOnce } from 'react-cool-hooks';
import { createRxFormArray, RxFormAbstractControl, RxFormArray, RxFormArrayInit } from '../core';


export function useRxFormArray<Value, Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>>(
  formArrayInit: RxFormArrayInit<Value, Control>,
): RxFormArray<Value, Control> {
  const formArray = useOnce(() => createRxFormArray(formArrayInit));

  useEffect(() => () => {
    formArray.destroy();
  }, []);

  return formArray;
}
