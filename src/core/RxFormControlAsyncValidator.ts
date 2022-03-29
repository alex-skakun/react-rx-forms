import { Observable } from 'rxjs';
import { RxFormControl } from './RxFormControl';
import { RxFormControlError } from './RxFormControlError';


export interface RxFormControlAsyncValidator<Value> extends CallableFunction {
  (control: RxFormControl<Value>): Promise<RxFormControlError> | Observable<RxFormControlError>;
}
