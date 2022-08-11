import { ReactElement, ReactNode } from 'react';
import { Render$ } from 'react-rx-tools';
import { RxFormControl, RxFormControlError } from '../core';
import { useRxFormGroupContext } from '../hooks';
import { CustomComponent } from '../types';


type RxControlErrorNameProps = {
  formControlName: string;
  children: (error: RxFormControlError) => ReactNode;
};

type RxControlErrorInstanceProps<T> = {
  formControl: RxFormControl<T>;
  children: (error: RxFormControlError) => ReactNode;
};

type RxControlErrorProps<T = unknown> = RxControlErrorNameProps | RxControlErrorInstanceProps<T>;

export const RxControlError = ((props: RxControlErrorProps): JSX.Element | null => {
  if (isControlNameProps(props)) {
    return renderAsControlName(props);
  }

  if (isControlInstanceProps(props)) {
    return renderAsControlInstance(props);
  }

  return null;
}) as CustomComponent<{
  (props: RxControlErrorNameProps): JSX.Element | null;
  <T>(props: RxControlErrorInstanceProps<T>): JSX.Element | null;
}>;

RxControlError.displayName = 'RxControlError';

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

  return <Render$ $={formControl.error$}>
    {error => error !== undefined && children(error)}
  </Render$>;
}

function renderAsControlInstance<T>({ formControl, children }: RxControlErrorInstanceProps<T>): ReactElement | null {
  return <Render$ $={formControl.error$}>
    {error => error !== undefined && children(error)}
  </Render$>;
}
