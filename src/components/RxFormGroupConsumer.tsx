import React, { ReactElement, ReactNode } from 'react';
import { useObservable } from 'react-rx-tools';
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
}) as {
  <T>(props: RxFormGroupConsumerGroupProps<T>): ReactElement | null;
  <T>(props: RxFormGroupConsumerGroupNameProps<T>): ReactElement | null;
};

function isGroup<T>(props: unknown): props is RxFormGroupConsumerGroupProps<T> {
  return (props as { group: RxFormGroup<T> }).group instanceof RxFormGroup;
}

function renderGroupContext<T>({ group, children }: RxFormGroupConsumerGroupProps<T>): ReactElement | null {
  const state = useObservable(group.state$)!;

  return <RxFormGroupContext.Provider value={[state, group]}>
    {typeof children === 'function' ? children(state, group) : children}
  </RxFormGroupContext.Provider>;
}

function isGroupName<T>(props: unknown): props is RxFormGroupConsumerGroupNameProps<T> {
  return !!(props as { groupName: string }).groupName;
}

function renderGroupNameContext<T>({ groupName, children }: RxFormGroupConsumerGroupNameProps<T>): ReactElement | null {
  const [, rootGroup] = useRxFormGroupContext<{ [key: string]: RxFormGroup<T> }>();

  if (!rootGroup) {
    throw new Error(`RxFormGroupConsumer with property "groupName" may be used only inside RxForm or other RxFormGroupConsumer.`);
  }

  const group = rootGroup.controls[groupName] as unknown as RxFormGroup<T>;

  if (!(group instanceof RxFormGroup)) {
    throw new Error(`Can't find group by name "${groupName}".`);
  }

  const state = useObservable<RxFormGroupState<T>>(group.state$)!;

  return <RxFormGroupContext.Provider value={[state, group]}>
    {typeof children === 'function' ? children(state, group) : children}
  </RxFormGroupContext.Provider>;
}
