import { createContext } from 'react';
import { RxFormGroup, RxFormGroupState } from '../models';


export type RxFormContextState<GroupType> = RxFormGroupState<GroupType> & { progress: boolean };

export type RxFormContextType<GroupType = any> = [
  (RxFormContextState<GroupType> | null),
  (RxFormGroup<GroupType> | null)
];

export const RxFormContext = createContext<RxFormContextType>([null, null]);
