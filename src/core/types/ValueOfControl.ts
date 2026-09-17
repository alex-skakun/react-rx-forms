import { RxFormAbstractControl } from '../RxFormAbstractControl';

export type ValueOfControl<Control> = Control extends RxFormAbstractControl<infer Value> ? Value : unknown;
