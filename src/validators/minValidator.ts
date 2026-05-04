import { RxFormControl, RxFormControlError, RxFormValidator } from '../core';


export default (<T extends number | string>(minValue: T) => (control: RxFormControl<T>): RxFormControlError => {
  return control.value >= minValue ? null : {
    validatorName: 'min',
    details: {
      actualValue: control.value,
      minValue,
    },
  };
}) as <T extends number | string>(min: T) => RxFormValidator<T>;
