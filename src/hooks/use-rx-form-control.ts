import { RxFormControl, RxFormControlInit, RxFormControlValidator } from 'models';
import { useMemo } from 'react';

export function useRxFormControl<ValueType>(controlInit: RxFormControlInit<ValueType>): RxFormControl<ValueType> {
  return useMemo(() => new RxFormControl(...getRxFormControlArgs(controlInit)) as RxFormControl<ValueType>, []);
}

function getRxFormControlArgs<ValueType>(controlInit: RxFormControlInit<ValueType>): ConstructorParameters<typeof RxFormControl> {
  if (Array.isArray(controlInit)) {
    return [controlInit[0], []];
  }

  return [controlInit, []];
}
