import { RxFormControl, RxFormValidatorResult, RxFormSyncValidator } from '../core';


export default ((control: RxFormControl<boolean>): RxFormValidatorResult => {
  return control.value ? null : { validatorName: 'requiredTrue' };
}) as RxFormSyncValidator<boolean>;
