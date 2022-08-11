export type CustomComponent<T> = CallableFunction & {
  displayName: string;
} & T;
