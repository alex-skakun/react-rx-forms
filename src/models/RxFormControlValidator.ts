import { RxFormControl } from './RxFormControl';
import { RxFormControlError } from './RxFormControlError';


export interface RxFormControlValidator<ValueType> extends CallableFunction {
  (control: RxFormControl<ValueType>): RxFormControlError;
}
