import { Observable } from 'rxjs';
import { useFunction, useOnce } from 'react-cool-hooks';
import { createRxFormGroup, RxFormGroup, RxFormGroupInit } from '../core';
import { useEffect } from 'react';


export function useRxFormGroup<Group>(formGroupInit: RxFormGroupInit<Group>): RxFormGroup<Group>;
export function useRxFormGroup<Group>(
  formGroupInit: RxFormGroupInit<Group>,
  onSubmit: (value: Group) => void | Promise<any> | Observable<any>,
): [RxFormGroup<Group>, () => void | Promise<any> | Observable<any>];

export function useRxFormGroup<Group>(
  formGroupInit: RxFormGroupInit<Group>,
  onSubmit?: (value: Group) => void | Promise<any> | Observable<any>,
): RxFormGroup<Group> | [RxFormGroup<Group>, (value: Group) => void | Promise<any> | Observable<any>] {
  const formGroup = useOnce(() => createRxFormGroup(formGroupInit));
  const onSubmitCallback = useFunction((value: Group) => onSubmit?.(value));

  useEffect(() => () => {
    formGroup.destroy();
  }, []);

  return onSubmit ? [formGroup, onSubmitCallback] : formGroup;
}
