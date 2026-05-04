import { InitialValue } from '../core/InitialValue';
import { ControlValue } from '../core/ControlValue';

export function normalizeControlValue<ValueType>(value: InitialValue<ValueType>): ControlValue<ValueType> {
  return value ?? null;
}
