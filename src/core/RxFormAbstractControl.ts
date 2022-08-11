import { Observable, Subject, Subscription } from 'rxjs';
import { RxFormControlError } from './RxFormControlError';
import { RxFormErrors } from './RxFormErrors';


export abstract class RxFormAbstractControl<ValueType> {
  readonly #subscription = new Subscription();
  readonly #tick = new Subject<void>();

  abstract readonly value: ValueType;
  abstract readonly value$: Observable<ValueType>;
  abstract readonly dirty: boolean;
  abstract readonly dirty$: Observable<boolean>;
  abstract readonly touched: boolean;
  abstract readonly touched$: Observable<boolean>;
  abstract readonly error: RxFormControlError | RxFormErrors;
  abstract readonly error$: Observable<RxFormControlError> | Observable<RxFormErrors>;
  abstract readonly valid: boolean;
  abstract readonly valid$: Observable<boolean>;

  protected readonly tick$ = this.#tick.asObservable();

  abstract setValue(value: ValueType): void;

  abstract reset(initialValue?: ValueType): void;

  abstract markAsTouched(): void;

  abstract markAsUntouched(): void;

  protected addSubscription(sub: Subscription): void {
    this.#subscription.add(sub);
  }

  protected nextTick(): void {
    this.#tick.next();
  }

  destroy(): void {
    this.#tick.complete();
    this.#subscription.unsubscribe();
  }
}
