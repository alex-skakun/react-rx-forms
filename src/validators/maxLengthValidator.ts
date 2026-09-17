import { RxFormControl, RxFormValidatorResult, RxFormSyncValidator } from '../core';


export default ((length: number) => (control: RxFormControl<string>): RxFormValidatorResult => {
  return control.value.length <= length ? null : {
    validatorName: 'maxLength',
    details: {
      actualLength: control.value.length,
      maxLength: length,
    },
  };
}) as (length: number) => RxFormSyncValidator<string>;
