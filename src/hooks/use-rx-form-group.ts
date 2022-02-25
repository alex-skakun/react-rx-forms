import { RxFormDescription, RxFormGroup } from 'models';
import { useMemo } from 'react';

export function useRxFormGroup<FormValueType>(formInit: RxFormDescription<FormValueType>): RxFormGroup<FormValueType> {
  return useMemo(() => new RxFormGroup(), []);
}
