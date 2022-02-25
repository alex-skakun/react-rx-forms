import { Observable } from 'rxjs';
import { RxFormControlError } from './rx-form-control-error';

export abstract class RxFormAbstractControl<ValueType> {
  abstract readonly value: ValueType;
  abstract readonly value$: Observable<ValueType>
  abstract readonly dirty: boolean;
  abstract readonly dirty$: Observable<boolean>;
  abstract readonly touched: boolean;
  abstract readonly touched$: Observable<boolean>;
  abstract readonly error: RxFormControlError;
  abstract readonly error$: Observable<RxFormControlError>;
  abstract readonly valid: boolean;
  abstract readonly valid$: Observable<boolean>;

  abstract setValue(value: ValueType): void;

  abstract reset(initialValue?: ValueType): void;

  abstract markAsTouched(): void;

  abstract markAsUntouched(): void;
}
