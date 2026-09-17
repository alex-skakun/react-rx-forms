import { RxFormControl, RxFormValidatorResult, RxFormSyncValidator } from '../core';


export default ((pattern: RegExp) => (control: RxFormControl<string>): RxFormValidatorResult => {
  return pattern.test(control.value) ? null : {
    validatorName: 'pattern',
    details: { actualValue: control.value },
  };
}) as (pattern: RegExp) => RxFormSyncValidator<string>;
