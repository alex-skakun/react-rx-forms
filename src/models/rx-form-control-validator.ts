import { RxFormControl } from './rx-form-control';
import { RxFormControlError } from './rx-form-control-error';

export type RxFormControlValidator<ValueType> = {
  (control: RxFormControl<ValueType>): RxFormControlError;
};
