import { InitialValue } from '../core/types/InitialValue';
import { ControlValue } from '../core/types/ControlValue';

export function normalizeControlValue<ValueType>(value: InitialValue<ValueType>): ControlValue<ValueType> {
  return value ?? null;
}
