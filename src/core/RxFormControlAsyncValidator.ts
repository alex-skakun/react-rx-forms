import { Observable } from 'rxjs';
import { RxFormControl } from './RxFormControl';
import { RxFormControlError } from './RxFormControlError';


export interface RxFormControlAsyncValidator<ValueType> extends CallableFunction {
  (control: RxFormControl<ValueType>): Promise<RxFormControlError> | Observable<RxFormControlError>;
}
