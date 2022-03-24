import { RxFormControlError } from './RxFormControlError';


export type RxFormErrors<T = unknown, K extends keyof T = keyof T> = null | {
  [P in K]: NonNullable<RxFormControlError> | NonNullable<RxFormErrors<T[P]>>;
};
