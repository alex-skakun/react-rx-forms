import { createContext } from 'react';
import { RxFormGroup, RxFormGroupState } from '../core';


export type RxFormGroupContextType<GroupType = any> = [
  (RxFormGroupState<GroupType> | null),
  (RxFormGroup<GroupType> | null)
];

export const RxFormGroupContext = createContext<RxFormGroupContextType>([null, null]);
