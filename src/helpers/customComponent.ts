import { FunctionComponent } from 'react';

import { CustomComponent } from '../types';


export function customComponent<T extends (...args: any[]) => any = FunctionComponent>(
  component: FunctionComponent,
  name = component.name,
): CustomComponent<T> {
  (component as CustomComponent<T>).displayName = name;

  return component as CustomComponent<T>;
}
