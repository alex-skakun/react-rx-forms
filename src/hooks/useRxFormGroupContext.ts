import { useContext } from 'react';
import { RxFormGroupContext, RxFormGroupContextType } from '../contexts';


export function useRxFormGroupContext<GroupType = unknown>(): RxFormGroupContextType<GroupType> {
  return useContext(RxFormGroupContext) as RxFormGroupContextType<GroupType>;
}
