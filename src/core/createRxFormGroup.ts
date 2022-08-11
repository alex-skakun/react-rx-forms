import { createRxFormControl, RxFormControlInit } from './createRxFormControl';
import { RxFormAbstractControl } from './RxFormAbstractControl';
import { ControlsMap, RxFormGroup } from './RxFormGroup';
import { Validators } from '../validators';


export type RxFormGroupInit<Group, ControlName extends keyof Group> = {
  [P in ControlName]: RxFormControlInit<Group[P]> | RxFormAbstractControl<Group[P]>;
};

export function createRxFormGroup<Group, ControlName extends keyof Group = keyof Group>(
  formGroupInit: RxFormGroupInit<Group, ControlName>,
): RxFormGroup<Group, ControlName> {
  return new RxFormGroup<Group, ControlName>(createControlsMap(formGroupInit));
}

function createControlsMap<Group, ControlName extends keyof Group>(
  formGroupInit: RxFormGroupInit<Group, ControlName>,
): ControlsMap<Group, ControlName> {
  return Object.entries(formGroupInit).reduce((controls, [controlName, controlInit]) => {
    if (controlInit instanceof RxFormAbstractControl) {
      controls[controlName as ControlName] = controlInit;
    } else {
      controls[controlName as ControlName] = createRxFormControl(controlInit) as RxFormAbstractControl<Group[ControlName]>;
    }

    return controls;
  }, {} as ControlsMap<Group, ControlName>);
}

const fg = createRxFormGroup({
  test: '',
  foo: [0, [Validators.max(10), Validators.min(0)]],
  data: createRxFormGroup({
    baz: false,
  }),
});

fg.controls.test.;
