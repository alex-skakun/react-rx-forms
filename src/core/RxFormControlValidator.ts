import { RxFormControl } from './RxFormControl';
import { RxFormControlError } from './RxFormControlError';


export interface RxFormControlValidator<Value> extends CallableFunction {
  (control: RxFormControl<Value>): RxFormControlError;
}
