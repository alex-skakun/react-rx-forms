import { useContext } from 'react';
import { RxFormContext, RxFormGroupContext, RxFormGroupContextType } from '../contexts';


export function useRxFormGroupContext<GroupType = unknown>(): RxFormGroupContextType<GroupType> {
  let closestGroupContext = useContext(RxFormGroupContext) as RxFormGroupContextType<GroupType>;
  let rootGroupContext = useContext(RxFormContext) as RxFormGroupContextType<GroupType>;

  return closestGroupContext || rootGroupContext;
}
