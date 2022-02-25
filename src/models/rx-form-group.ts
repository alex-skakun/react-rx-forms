import { RxFormAbstractControl } from './rx-form-abstract-item';

export class RxFormGroup<FormType> extends RxFormAbstractControl<FormType>{

  readonly dirty: boolean;
  readonly dirty$: Observable<boolean>;
  readonly error: RxFormControlError;
  readonly error$: Observable<RxFormControlError>;


  constructor(controls: Map<string, RxFormAbstractControl>) {
    super();
  }

  markAsTouched(): void {
  }

  markAsUntouched(): void {
  }

  reset(initialValue: FormType | undefined): void {
  }

  setValue(value: FormType): void {
  }

  readonly touched: boolean;
  readonly touched$: Observable<boolean>;
  readonly valid: boolean;
  readonly valid$: Observable<boolean>;
  readonly value: FormType;
  readonly value$: Observable<FormType>;
}