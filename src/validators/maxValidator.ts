import { RxFormControl, RxFormControlError, RxFormControlValidator } from '../core';


export default (<T extends number | string>(maxValue: T) => (control: RxFormControl<T>): RxFormControlError => {
  return control.value <= maxValue ? null : {
    validatorName: 'max',
    details: {
      actualValue: control.value,
      maxValue
    }
  };
}) as <T extends number | string>(max: T) => RxFormControlValidator<T>;
