import { RxFormControl, RxFormValidatorResult, RxFormSyncValidator } from '../core';


export default (<T extends number | string>(minValue: T) => (control: RxFormControl<T>): RxFormValidatorResult => {
  return control.value >= minValue ? null : {
    validatorName: 'min',
    details: {
      actualValue: control.value,
      minValue,
    },
  };
}) as <T extends number | string>(min: T) => RxFormSyncValidator<T>;
