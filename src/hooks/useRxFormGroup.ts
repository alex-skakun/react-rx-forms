import { useMemo } from 'react';
import { createRxFormGroup, RxFormGroup, RxFormGroupInit } from '../core';


export function useRxFormGroup<Group>(formGroupInit: RxFormGroupInit<Group>): RxFormGroup<Group> {
  return useMemo(() => createRxFormGroup(formGroupInit), []);
}
