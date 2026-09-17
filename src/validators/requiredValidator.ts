import { RxFormControl, RxFormValidatorResult, RxFormSyncValidator } from '../core';


export default ((control: RxFormControl<any>): RxFormValidatorResult => {
  return control.dirty ? null : { validatorName: 'required' };
}) as RxFormSyncValidator<any>;
