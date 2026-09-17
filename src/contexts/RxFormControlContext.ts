import { createContext, ForwardedRef } from 'react';
import { RxFormValidatorResult } from '../core';


export type RxFormControlContextType<V = any, R = Element> = {
  model: V;
  ref: ForwardedRef<R>;
  error: RxFormValidatorResult | null;
  valid: boolean;
  dirty: boolean;
  touched: boolean;
  disabled: boolean;
  cssClasses: string;
  setModel(value: V): void;
  markAsTouched(): void;
};

export const RxFormControlContext = createContext<null | RxFormControlContextType>(null);
