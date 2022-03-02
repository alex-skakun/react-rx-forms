export function propsWithDefaults<T, P extends Partial<T>>(props: T, defaults: P): Omit<T, keyof P> & Required<P> {
  return {
    ...defaults as Required<P>,
    ...props as Omit<T, keyof P>
  };
}
