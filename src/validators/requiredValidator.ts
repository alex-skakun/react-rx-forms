import { RxFormControl, RxFormControlError, RxFormControlValidator } from '../core';


export default ((control: RxFormControl<any>): RxFormControlError => {
  return control.dirty ? null : { validatorName: 'required' };
}) as RxFormControlValidator<any>;
