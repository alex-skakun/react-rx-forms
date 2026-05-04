import { RxFormValidator } from '../core';


type GetPrimitiveOf<T extends string | number> = T extends string ? string : number;

export function max<T extends string | number>(maxValue: T): RxFormValidator<GetPrimitiveOf<T>> {
  return control => {
    return control.value <= maxValue ? null : {
      validatorName: 'max',
      details: {
        actualValue: control.value,
        maxValue,
      },
    };
  };
}
