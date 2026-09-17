import { RxFormControl, RxFormValidatorResult, RxFormSyncValidator } from '../core';


export default ((length: number) => (control: RxFormControl<string>): RxFormValidatorResult => {
  return control.value.length >= length ? null : {
    validatorName: 'minLength',
    details: {
      actualLength: control.value.length,
      minLength: length,
    },
  };
}) as (length: number) => RxFormSyncValidator<string>;
