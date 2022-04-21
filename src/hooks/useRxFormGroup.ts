import { useCallback, useMemo } from 'react';
import { createRxFormGroup, RxFormGroup, RxFormGroupInit } from '../core';
import { Observable } from 'rxjs';


export function useRxFormGroup<Group>(formGroupInit: RxFormGroupInit<Group>): RxFormGroup<Group>;
export function useRxFormGroup<Group>(
  formGroupInit: RxFormGroupInit<Group>,
  onSubmit: (value: Group) => void | Promise<any> | Observable<any>,
): [RxFormGroup<Group>, () => void | Promise<any> | Observable<any>];

export function useRxFormGroup<Group>(
  formGroupInit: RxFormGroupInit<Group>,
  onSubmit?: (value: Group) => void | Promise<any> | Observable<any>,
): RxFormGroup<Group> | [RxFormGroup<Group>, (value: Group) => void | Promise<any> | Observable<any>] {
  const formGroup = useMemo(() => createRxFormGroup(formGroupInit), []);
  const onSubmitCallback = useCallback(onSubmit ?? (() => {}), []);

  return onSubmit ? [formGroup, onSubmitCallback] : formGroup;
}
