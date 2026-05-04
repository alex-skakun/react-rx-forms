import { RxFormControl, RxFormControlError, RxFormValidator } from '../core';


export default ((control: RxFormControl<any>): RxFormControlError => {
  return control.dirty ? null : { validatorName: 'required' };
}) as RxFormValidator<any>;
