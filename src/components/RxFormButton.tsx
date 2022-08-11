import { ButtonHTMLAttributes, forwardRef, RefAttributes } from 'react';

import { customComponent, fillDefaults } from '../helpers';


type RxFormButtonProps<A extends any[] = any[]> = ButtonHTMLAttributes<HTMLButtonElement> & {
  clickArgs?: A;
  onBindClick?: (...args: A) => void;
};

const DEFAULT_PROPS: Partial<RxFormButtonProps> = {
  type: 'button',
};

export const RxFormButton = customComponent<{
  <A extends any[]>(props: RxFormButtonProps<A> & RefAttributes<HTMLButtonElement>): JSX.Element;
}>(forwardRef<HTMLButtonElement, RxFormButtonProps>((props, forwardedRef) => {
  const { children, ...attrs } = fillDefaults(props, DEFAULT_PROPS);


  return <button {...attrs} ref={forwardedRef}>{children}</button>;
}), 'RxFormButton');
