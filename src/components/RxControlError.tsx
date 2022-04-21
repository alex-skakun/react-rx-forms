import React, { ReactElement, ReactNode } from 'react';
import { useObservable } from 'react-rx-tools';
import { RxFormControl, RxFormControlError } from '../core';
import { useRxFormGroupContext } from '../hooks';


type RxControlErrorNameProps = {
  formControlName: string;
  children: (error: RxFormControlError) => ReactNode;
};

type RxControlErrorInstanceProps<T> = {
  formControl: RxFormControl<T>;
  children: (error: RxFormControlError) => ReactNode;
};

type RxControlErrorProps<T = unknown> = RxControlErrorNameProps | RxControlErrorInstanceProps<T>;

export const RxControlError = ((props: RxControlErrorProps): ReactElement | null => {
  if (isControlNameProps(props)) {
    return renderAsControlName(props);
  }

  if (isControlInstanceProps(props)) {
    return renderAsControlInstance(props);
  }

  return null;
}) as {
  (props: RxControlErrorNameProps): ReactElement | null;
  <T>(props: RxControlErrorInstanceProps<T>): ReactElement | null;
};

function isControlNameProps(props: RxControlErrorProps): props is RxControlErrorNameProps {
  return !!(props as RxControlErrorNameProps).formControlName;
}

function isControlInstanceProps<T>(props: RxControlErrorProps<T>): props is RxControlErrorInstanceProps<T> {
  return (props as RxControlErrorInstanceProps<T>).formControl instanceof RxFormControl;
}

function renderAsControlName({ formControlName, children }: RxControlErrorNameProps): ReactElement | null {
  const [, formGroup] = useRxFormGroupContext<{ [controlName: typeof formControlName]: RxFormControl<unknown> }>();

  if (!formGroup) {
    throw new Error(`RxControlError with property "formControlName" may be used only inside RxForm or RxFormGroupConsumer.`);
  }

  const formControl = formGroup.controls[formControlName];

  if (!(formControl instanceof RxFormControl)) {
    throw new Error(`Can't find control by name "${formControlName}".`);
  }

  const error = useObservable(formControl.error$)!;

  return <>{children(error)}</>;
}

function renderAsControlInstance<T>({ formControl, children }: RxControlErrorInstanceProps<T>): ReactElement | null {
  const error = useObservable(formControl.error$)!;

  return <>{children(error)}</>;
}
