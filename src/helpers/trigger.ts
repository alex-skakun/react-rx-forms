import { RxFormAbstractControl } from '../core';


export const trigger = () => <T extends RxFormAbstractControl<any>, M extends (this: T, ...args: any[]) => any>(
  contructor: T,
  methodName: string | symbol,
  descriptor: TypedPropertyDescriptor<M>,
): TypedPropertyDescriptor<M> => {
  const originalMethod = descriptor.value!;

  descriptor.value = function (this: T, ...args: Parameters<typeof originalMethod>): ReturnType<typeof originalMethod> {
    const result = originalMethod.apply(this, args);

    this.nextTick();

    return result;
  } as M;

  return descriptor;
}
