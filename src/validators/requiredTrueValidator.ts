import { RxFormControl, RxFormControlError, RxFormControlValidator } from '../core';


export default ((control: RxFormControl<boolean>): RxFormControlError => {
  return control.value ? null : { validatorName: 'requiredTrue' };
}) as RxFormControlValidator<boolean>;
