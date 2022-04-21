import { createContext, ForwardedRef } from 'react';


export type RxFormControlContextType<V = any, R extends Element = Element> = {
  model: V;
  ref: ForwardedRef<R>;
  valid: boolean;
  dirty: boolean;
  touched: boolean;
  disabled: boolean;
  cssClasses: string;
  setModel(value: V): void;
  markAsTouched(): void;
};

export const RxFormControlContext = createContext<null | RxFormControlContextType>(null);
