import { RxFormControl, RxFormControlError, RxFormControlValidator } from '../core';


export default ((length: number) => (control: RxFormControl<string>): RxFormControlError => {
  return control.value.length <= length ? null : {
    validatorName: 'maxLength',
    details: {
      actualLength: control.value.length,
      maxLength: length
    }
  };
}) as (length: number) => RxFormControlValidator<string>;
