import { Observable, Subject } from 'rxjs';
import { ControlTrigger } from './constants';
import { samplerTrigger } from './decorators';
import { RxFormAbstractControl } from './RxFormAbstractControl';
import { INIT_DISABLED_SOURCE, INIT_ERRORS_SOURCE, INIT_TOUCHED_SOURCE, INIT_VALUE_SOURCE } from './tokens';
import type { ControlValue, InitialValue, RxFormAbstractControlOptions, RxFormErrors } from './types';

export class RxFormControl<ValueType> extends RxFormAbstractControl<ControlValue<ValueType>> {
  readonly #valueSubject = new Subject<InitialValue<ValueType>>();
  readonly #disabledSubject = new Subject<boolean>();
  readonly #touchedSubject = new Subject<boolean>();
  #initialValue: InitialValue<ValueType>;

  constructor(
    initialValue?: InitialValue<ValueType>,
    options?: RxFormAbstractControlOptions<NoInfer<ControlValue<ValueType>>>,
  ) {
    super(initialValue, options);
  }

  @samplerTrigger({ trigger: ControlTrigger.VALUE })
  reset(initialValue?: InitialValue<ValueType>): void {
    this.#initialValue = initialValue === undefined ? this.#initialValue : initialValue;
    this.#valueSubject.next(this.#initialValue);
  }

  @samplerTrigger({ trigger: ControlTrigger.VALUE })
  setValue(value: InitialValue<ValueType>): this {
    this.#valueSubject.next(value);
    return this;
  }

  @samplerTrigger({ trigger: ControlTrigger.DISABLED })
  disable(): this {
    this.#disabledSubject.next(true);
    return this;
  }

  @samplerTrigger({ trigger: ControlTrigger.DISABLED })
  enable(): this {
    this.#disabledSubject.next(false);
    return this;
  }

  @samplerTrigger({ trigger: ControlTrigger.TOUCHED })
  markAsTouched(): this {
    this.#touchedSubject.next(true);
    return this;
  }

  @samplerTrigger({ trigger: ControlTrigger.TOUCHED })
  markAsUntouched(): this {
    this.#touchedSubject.next(false);
    return this;
  }

  protected [INIT_VALUE_SOURCE](initialValue: InitialValue<ValueType>): Observable<InitialValue<ValueType>> {
    this.#initialValue = initialValue;

    return this.#valueSubject;
  }

  protected [INIT_DISABLED_SOURCE](): Observable<boolean> {
    return this.#disabledSubject;
  }

  protected [INIT_TOUCHED_SOURCE](): Observable<boolean> {
    return this.#touchedSubject;
  }

  protected [INIT_ERRORS_SOURCE](validatorsResult$: Observable<RxFormErrors>): Observable<RxFormErrors> {
    return validatorsResult$;
  }
}
