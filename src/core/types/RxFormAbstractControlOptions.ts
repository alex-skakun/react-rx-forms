import type { RxFormAbstractControl } from '../RxFormAbstractControl';
import { AsyncValidatorsRunStrategy } from './AsyncValidatorsRunStrategy';
import { AsyncValidatorsStrategy } from './AsyncValidatorsStrategy';
import { RxFormAsyncValidator } from './RxFormAsyncValidator';
import { RxFormSyncValidator } from './RxFormSyncValidator';
import { SyncValidatorsStrategy } from './SyncValidatorsStrategy';

export interface RxFormAbstractControlOptions<
  ValueType,
  Control extends RxFormAbstractControl<ValueType> = RxFormAbstractControl<ValueType>
> {
  disabled?: boolean;
  touched?: boolean;
  syncValidators?: RxFormSyncValidator<ValueType, Control | RxFormAbstractControl<ValueType>>[],
  asyncValidators?: RxFormAsyncValidator<ValueType, Control | RxFormAbstractControl<ValueType>>[],
  syncValidatorsStrategy?: SyncValidatorsStrategy;
  asyncValidatorsStrategy?: AsyncValidatorsStrategy;
  asyncValidatorsRunStrategy?: AsyncValidatorsRunStrategy;
  asyncValidatorsDebounceTime?: number;
}
