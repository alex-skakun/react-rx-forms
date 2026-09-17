import { RxFormErrors } from './RxFormErrors';

export interface RxFormControlState<ValueType> {
  value: ValueType;
  disabled: boolean;
  touched: boolean;
  errors: RxFormErrors;
  dirty: boolean;
  valid: boolean;
}
