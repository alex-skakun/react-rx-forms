import type { RxFormAbstractControl } from '../RxFormAbstractControl';
import { RxFormValidatorResult } from './RxFormValidatorResult';

export interface RxFormSyncValidator<
  Value,
  Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>
> extends CallableFunction {
  (control: Control): RxFormValidatorResult;
}

export interface RxFormSyncValidatorFactory<
  Value,
  Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>
> extends CallableFunction {
  (...args: any[]): RxFormSyncValidator<Value, Control>;
}

export interface RxFormComposedSyncValidator<
  Value,
  Control extends RxFormAbstractControl<Value> = RxFormAbstractControl<Value>,
  Validators extends RxFormSyncValidator<Value, Control>[] = RxFormSyncValidator<Value, Control>[]
> extends RxFormSyncValidator<Value, Control> {
  decompose: () => Validators;
}
