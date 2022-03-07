import React, { FormEvent, FormHTMLAttributes, PureComponent, ReactElement, ReactNode, RefObject } from 'react';
import { Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { RxFormGroupContext, RxFormGroupContextState } from '../contexts';
import { classNames, propsWithDefaults } from '../helpers';
import { RxFormGroup, RxFormGroupState } from '../models';


type RxFormProps<GroupType> = Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> & {
  group: RxFormGroup<GroupType>;
  forwardedRef?: RefObject<HTMLFormElement>;
  children: ReactNode | {
    (state: RxFormGroupContextState<GroupType>): ReactNode;
  };
  onSubmit?(value: GroupType): void | Promise<any> | Observable<any>;
};

type RxFormState<GroupType> = {
  progress: boolean;
  groupState: null | RxFormGroupState<GroupType>;
};

export class RxForm<GroupType> extends PureComponent<RxFormProps<GroupType>, RxFormState<GroupType>> {
  #stateSubscription = Subscription.EMPTY;
  #progressSubscription = Subscription.EMPTY;

  readonly #submitCallback: (event: FormEvent) => void;

  constructor(props: RxFormProps<GroupType>) {
    super(props);
    this.state = {
      progress: false,
      groupState: null
    };
    this.#submitCallback = (event: FormEvent) => this.#onSubmit(event);
  }

  componentDidMount(): void {
    this.#updateGroupStateSubscription();
  }

  componentWillUnmount(): void {
    this.#stateSubscription.unsubscribe();
    this.#progressSubscription.unsubscribe();
  }

  componentDidUpdate() {
    this.#updateGroupStateSubscription();
  }

  render(): ReactElement {
    let { group, children, className, forwardedRef, onSubmit, ...attrs } = propsWithDefaults(this.props, { noValidate: true });
    let { progress, groupState } = this.state;
    let contextState: RxFormGroupContextState<GroupType> = { progress, ...groupState! };
    let cssClasses = classNames({
      'rx-form-valid': groupState!.valid,
      'rx-form-invalid': !groupState!.valid,
      'rx-form-dirty': groupState!.dirty,
      'rx-form-touched': groupState!.touched
    });

    return <form ref={forwardedRef} onSubmit={this.#submitCallback} className={classNames(className, cssClasses)} {...attrs}>
      <RxFormGroupContext.Provider value={[contextState, group]}>
        {typeof children === 'function' ? children(contextState) : children}
      </RxFormGroupContext.Provider>
    </form>;
  }

  #onSubmit(event: FormEvent): void {
    event.preventDefault();

    let { group, onSubmit } = this.props;

    if (onSubmit) {
      let submitResult = onSubmit(group.value);

      this.#progressSubscription = of(null)
        .pipe(
          tap(() => this.setState({ progress: true })),
          switchMap(() => submitResult ?? of(submitResult)),
          tap(() => this.setState({ progress: false }))
        )
        .subscribe();
    }
  }

  #updateGroupStateSubscription(): void {
    this.#stateSubscription.unsubscribe();
    this.#stateSubscription = this.props.group.state$.subscribe(groupState => this.setState({ groupState }));
  }

}
