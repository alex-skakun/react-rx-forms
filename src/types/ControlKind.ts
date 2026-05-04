import {RxFormAbstractControl, RxFormArray, RxFormControl, RxFormControlInit, RxFormGroup} from "../core";

export type ControlKind<K, T> = K extends RxFormArray<T>
    ? RxFormArray<T>
    : K extends RxFormGroup<T>
        ? RxFormGroup<T>
        : K extends RxFormControl<T>
            ? RxFormControl<T>
            : K extends RxFormControlInit<T>
              ? RxFormControl<T>
              : RxFormAbstractControl<T, any>;
