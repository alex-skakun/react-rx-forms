import { useContext } from 'react';
import { RxFormContext, RxFormGroupContext, RxFormGroupContextType } from '../contexts';


export function useRxFormGroupContext<GroupType = unknown>(): RxFormGroupContextType<GroupType> {
  const [parentGroupContext, parentGroup] = useContext(RxFormGroupContext) as RxFormGroupContextType<GroupType>;
  const [rootGroupContext, rootGroup] = useContext(RxFormContext) as RxFormGroupContextType<GroupType>;

  return parentGroupContext && parentGroup ? [parentGroupContext, parentGroup] : [rootGroupContext, rootGroup];
}
