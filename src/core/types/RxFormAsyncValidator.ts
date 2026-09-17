import { Observable } from 'rxjs';
import { RxFormAbstractControl } from '../index';
import { RxFormValidatorResult } from './RxFormValidatorResult';

export type RxFormAsyncValidatorResult = Promise<RxFormValidatorResult> | Observable<RxFormValidatorResult>;

export interface RxFormAsyncValidator<
  Value,
  Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>
> extends CallableFunction {
  (control: Control, abort$: Observable<any>): RxFormAsyncValidatorResult;
}

export interface RxFormComposedAsyncValidators<
  Value,
  Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>,
  Validators extends RxFormAsyncValidator<Value, Control>[] = RxFormAsyncValidator<Value, Control>[]
> extends RxFormAsyncValidator<Value, Control> {
  decompose: () => Validators;
}
