export type Constructor<T extends new (...args: any) => any> = {
  new (...args: ConstructorParameters<T>): InstanceType<T>;
};
