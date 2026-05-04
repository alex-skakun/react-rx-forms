import { RxFormControl, RxFormControlError, RxFormValidator } from '../core';


export default ((length: number) => (control: RxFormControl<string>): RxFormControlError => {
  return control.value.length >= length ? null : {
    validatorName: 'minLength',
    details: {
      actualLength: control.value.length,
      minLength: length,
    },
  };
}) as (length: number) => RxFormValidator<string>;
