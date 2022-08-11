import { ReactNode } from 'react';

import { RxFormAbstractControl, RxFormArray } from '../core';
import { customComponent } from '../helpers/customComponent';
import { useRxFormGroupContext } from '../hooks';


type RxFormArrayConsumerProps<T, C extends RxFormAbstractControl<T>> = {
  arrayName: string;
  children(group: RxFormArray<T, C>): ReactNode;
};

export const RxFormArrayConsumer = customComponent<{
  <T, C extends RxFormAbstractControl<T>>(props: RxFormArrayConsumerProps<T, C>): JSX.Element;
}>(function RxFormArrayConsumer<T, C extends RxFormAbstractControl<T>>({ arrayName, children }: RxFormArrayConsumerProps<T, C>) {
  const [, rootGroup] = useRxFormGroupContext<{ [key: string]: RxFormArray<T, C> }>();

  if (!rootGroup) {
    throw new Error(`RxFormArrayConsumer with property "arrayName" may be used only inside RxForm or RxFormGroupConsumer.`);
  }

  const array = rootGroup.controls[arrayName] as unknown as RxFormArray<T, C>;

  if (!(array instanceof RxFormArray)) {
    throw new Error(`Can't find array by name "${arrayName}".`);
  }

  return <>{children(array)}</>;
});
