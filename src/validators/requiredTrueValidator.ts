import { RxFormControl, RxFormControlError, RxFormValidator } from '../core';


export default ((control: RxFormControl<boolean>): RxFormControlError => {
  return control.value ? null : { validatorName: 'requiredTrue' };
}) as RxFormValidator<boolean>;
