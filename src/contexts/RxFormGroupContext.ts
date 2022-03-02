import { createContext } from 'react';
import { RxFormGroup, RxFormGroupState } from '../models';


export type RxFormGroupContextState<GroupType> = RxFormGroupState<GroupType> & { progress: boolean };

export type RxFormGroupContextType<GroupType = any> = [
  (RxFormGroupContextState<GroupType> | null),
  (RxFormGroup<GroupType> | null)
];

export const RxFormGroupContext = createContext<RxFormGroupContextType>([null, null]);
