import { RxFormControlValidator } from 'models/rx-form-control-validator';

export type RxFormDescription<ValueType, FieldName extends keyof ValueType = keyof ValueType> = {
  [Property in FieldName]: ValueType[Property] | [ValueType[Property]] | [ValueType[Property], RxFormControlValidator<ValueType[Property]>];
}

