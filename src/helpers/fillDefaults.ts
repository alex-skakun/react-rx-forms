export function fillDefaults<T extends Record<keyof any, any>, O extends Partial<T>, D extends Partial<T | O>>(
  original: O,
  defaults: D
): Omit<O, keyof D> & Required<Pick<O, Extract<keyof O, keyof D>>> {
  return {
    ...defaults as unknown as Required<Pick<O, Extract<keyof O, keyof D>>>,
    ...original as Omit<O, keyof D>,
  };
}
