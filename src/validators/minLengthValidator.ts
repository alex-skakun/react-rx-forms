import { RxFormControl, RxFormControlError, RxFormControlValidator } from '../core';


export default ((length: number) => (control: RxFormControl<string>): RxFormControlError => {
  return control.value.length >= length ? null : {
    validatorName: 'minLength',
    details: {
      actualLength: control.value.length,
      minLength: length
    }
  };
}) as (length: number) => RxFormControlValidator<string>;
