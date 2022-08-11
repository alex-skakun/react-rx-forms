import { ReactNode, useMemo } from 'react';
import { isFunction } from 'value-guards';
import { useObservable } from 'react-rx-tools';

import type { CustomComponent } from '../types';
import { RxFormGroupContext } from '../contexts';
import { RxFormGroup, RxFormGroupState } from '../core';
import { useRxFormGroupContext } from '../hooks';


type RxFormGroupConsumerGroupProps<T> = {
  group: RxFormGroup<T>
  children: ReactNode | {
    (state: RxFormGroupState<T>, group: RxFormGroup<T>): ReactNode
  };
};

type RxFormGroupConsumerGroupNameProps<T> = {
  groupName: string;
  children: ReactNode | {
    (state: RxFormGroupState<T>, group: RxFormGroup<T>): ReactNode
  };
};

export const RxFormGroupConsumer = ((props: {}) => {
  if (isGroup(props)) {
    return renderGroupContext(props);
  }

  if (isGroupName(props)) {
    return renderGroupNameContext(props);
  }

  return null;
}) as CustomComponent<{
  <T>(props: RxFormGroupConsumerGroupProps<T>): JSX.Element;
  <T>(props: RxFormGroupConsumerGroupNameProps<T>): JSX.Element;
}>;

RxFormGroupConsumer.displayName = 'RxFormGroupConsumer';

function isGroup<T>(props: unknown): props is RxFormGroupConsumerGroupProps<T> {
  return (props as { group: RxFormGroup<T> }).group instanceof RxFormGroup;
}

function renderGroupContext<T>({ group, children }: RxFormGroupConsumerGroupProps<T>): JSX.Element | null {
  const { value, dirty, touched, error, valid } = useObservable(group.state$)!;
  const contextValue = useMemo((): [RxFormGroupState<T>, RxFormGroup<T>] => [
    { value, dirty, touched, error, valid },
    group,
  ], [value, dirty, touched, error, valid, group]);

  return <RxFormGroupContext.Provider value={contextValue}>
    {isFunction(children) ? children(...contextValue) : children}
  </RxFormGroupContext.Provider>;
}

function isGroupName<T>(props: unknown): props is RxFormGroupConsumerGroupNameProps<T> {
  return !!(props as { groupName: string }).groupName;
}

function renderGroupNameContext<T>({ groupName, children }: RxFormGroupConsumerGroupNameProps<T>): JSX.Element | null {
  const [, rootGroup] = useRxFormGroupContext<{ [key: string]: RxFormGroup<T> }>();

  if (!rootGroup) {
    throw new Error(`RxFormGroupConsumer with property "groupName" may be used only inside RxForm or other RxFormGroupConsumer.`);
  }

  const group = rootGroup.controls[groupName] as unknown as RxFormGroup<T>;

  if (!(group instanceof RxFormGroup)) {
    throw new Error(`Can't find group by name "${groupName}".`);
  }

  return renderGroupContext<T>({ group, children });
}
