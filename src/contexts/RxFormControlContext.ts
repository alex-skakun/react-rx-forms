import { createContext, ForwardedRef } from 'react';
import { RxFormControlError } from '../core';


export type RxFormControlContextType<V = any, R = Element> = {
  model: V;
  ref: ForwardedRef<R>;
  error: RxFormControlError | null;
  valid: boolean;
  dirty: boolean;
  touched: boolean;
  disabled: boolean;
  cssClasses: string;
  setModel(value: V): void;
  markAsTouched(): void;
};

export const RxFormControlContext = createContext<null | RxFormControlContextType>(null);
