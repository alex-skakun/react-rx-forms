import { createRxFormControl, RxFormControlInit } from './createRxFormControl';
import { RxFormAbstractControl } from './RxFormAbstractControl';
import { RxFormGroup, RxFormGroupControls } from './RxFormGroup';


export type RxFormGroupInit<Group, ControlName extends keyof Group = keyof Group> = {
  [P in ControlName]: RxFormControlInit<Group[P]> | RxFormAbstractControl<Group[P]>;
};

export function createRxFormGroup<Group>(formGroupInit: RxFormGroupInit<Group>): RxFormGroup<Group> {
  return new RxFormGroup<Group>(createControlsMap(formGroupInit));
}

function createControlsMap<Group, ControlName extends keyof Group = keyof Group>(
  formGroupInit: RxFormGroupInit<Group>
): RxFormGroupControls<Group> {
  return Object.entries(formGroupInit).reduce((controls, [controlName, controlInit]) => {
    if (controlInit instanceof RxFormAbstractControl) {
      controls[controlName as ControlName] = controlInit;
    } else {
      controls[controlName as ControlName] = createRxFormControl(controlInit) as RxFormAbstractControl<Group[ControlName]>;
    }

    return controls;
  }, {} as RxFormGroupControls<Group>);
}
