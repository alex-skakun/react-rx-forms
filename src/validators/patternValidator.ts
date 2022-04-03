import { RxFormControl, RxFormControlError, RxFormControlValidator } from '../core';


export default ((pattern: RegExp) => (control: RxFormControl<string>): RxFormControlError => {
  return pattern.test(control.value) ? null : {
    validatorName: 'pattern',
    details: { actualValue: control.value }
  };
}) as (pattern: RegExp) => RxFormControlValidator<string>;
