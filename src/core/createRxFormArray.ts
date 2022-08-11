import { createRxFormControl, RxFormControlInit } from './createRxFormControl';
import { RxFormAbstractControl } from './RxFormAbstractControl';
import { ControlsArray, RxFormArray } from './RxFormArray';
import { RxFormControl } from './RxFormControl';


type RxFormControlArrayInit<Value, Control extends RxFormAbstractControl<Value>> = Array<RxFormControl<Value> |
  RxFormControlInit<Value>>;
type RxFormAbstractArrayInit<Value, Control extends RxFormAbstractControl<Value>> = Array<Control>;

export type RxFormArrayInit<Value, Control extends RxFormAbstractControl<Value>> =
  RxFormAbstractArrayInit<Value, Control> |
  RxFormControlArrayInit<Value, Control>;

export function createRxFormArray<Value, Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>>(
  formArrayInit: RxFormArrayInit<Value, Control>,
): RxFormArray<Value, Control> {
  return new RxFormArray<Value, Control>(createControls(formArrayInit));
}

function createControls<Value, Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>>(
  formArrayInit: RxFormArrayInit<Value, Control>,
): ControlsArray<Value, Control> {
  return formArrayInit.map(controlInit => {
    if (controlInit instanceof RxFormAbstractControl) {
      return controlInit as Control;
    } else {
      return createRxFormControl(controlInit) as unknown as Control;
    }
  });
}
