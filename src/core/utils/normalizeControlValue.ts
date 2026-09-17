import { ControlValue, InitialValue } from '../types';

export function normalizeControlValue<ValueType>(value: InitialValue<ValueType>): ControlValue<ValueType> {
  return value ?? null;
}
