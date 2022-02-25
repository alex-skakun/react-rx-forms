import { RxFormControlValidator } from 'models/rx-form-control-validator';

export type RxFormControlInit<ValueType> = ValueType | [ValueType] | [ValueType, RxFormControlValidator<ValueType>] | [ValueType, Array<RxFormControlValidator<ValueType>>];
