import { useMemo } from 'react';
import { RxFormAbstractControl, RxFormGroup, RxFormGroupControls } from '../models';
import { createRxFormControl, RxFormControlInit } from './useRxFormControl';


export type RxFormGroupInit<GroupType, FieldName extends keyof GroupType = keyof GroupType> = {
  [Property in FieldName]: RxFormControlInit<GroupType[Property]> | RxFormAbstractControl<GroupType[Property]>;
};

export function useRxFormGroup<GroupType>(formGroupInit: RxFormGroupInit<GroupType>): RxFormGroup<GroupType> {
  return useMemo(() => createRxFormGroup(formGroupInit), []);
}

export function createRxFormGroup<GroupType>(formGroupInit: RxFormGroupInit<GroupType>): RxFormGroup<GroupType> {
  return new RxFormGroup<GroupType>(createControlsMap(formGroupInit));
}

function createControlsMap<GroupType, FieldName extends keyof GroupType = keyof GroupType>(
  formGroupInit: RxFormGroupInit<GroupType>
): RxFormGroupControls<GroupType> {
  return Object.entries(formGroupInit).reduce((controls, [controlName, controlInit]) => {
    if (controlInit instanceof RxFormAbstractControl) {
      controls[controlName as FieldName] = controlInit;
    } else {
      controls[controlName as FieldName] = createRxFormControl(controlInit) as RxFormAbstractControl<GroupType[FieldName]>;
    }

    return controls;
  }, {} as RxFormGroupControls<GroupType>);
}
