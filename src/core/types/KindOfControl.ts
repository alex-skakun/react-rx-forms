import {RxFormAbstractControl, RxFormArray, RxFormControl, RxFormControlInit, RxFormGroup} from "../index";

export type KindOfControl<Control, Value> = Control extends RxFormArray<Value>
    ? RxFormArray<Value>
    : Control extends RxFormGroup<Value>
        ? RxFormGroup<Value>
        : Control extends RxFormControl<Value>
            ? RxFormControl<Value>
            : Control extends RxFormControlInit<Value>
              ? RxFormControl<Value>
              : RxFormAbstractControl<Value>;
