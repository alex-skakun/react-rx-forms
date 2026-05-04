import { RxFormControl } from './RxFormControl';
import { RxFormControlError } from './RxFormControlError';
import { RxFormAbstractControl } from './RxFormAbstractControl';


export interface RxFormValidator<Value> extends CallableFunction {
  (control: RxFormAbstractControl<Value>): RxFormControlError;
}
