import React, { CSSProperties, PureComponent, ReactElement, ReactNode } from 'react';
import { Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { RxFormGroupContext, RxFormGroupContextState } from '../contexts';
import { propsWithDefaults } from '../helpers';
import { RxFormGroup, RxFormGroupState } from '../models';


type SupportedNativeFormAttributes = {
  id: string;
  name: string;
  className: string;
  style: CSSProperties;
  noValidate: boolean;
};

type RxFormProps<GroupType> = Partial<SupportedNativeFormAttributes> & {
  group: RxFormGroup<GroupType>;
  children: ReactNode | {
    (state: RxFormGroupContextState<GroupType>): ReactNode;
  };
  onSubmit(value: GroupType): void | Promise<any> | Observable<any>;
};

type RxFormState<GroupType> = {
  progress: boolean;
  groupState: null | RxFormGroupState<GroupType>;
};

export class RxForm<GroupType> extends PureComponent<RxFormProps<GroupType>, RxFormState<GroupType>> {
  #stateSubscription = Subscription.EMPTY;
  #progressSubscription = Subscription.EMPTY;

  readonly #submitCallback: () => void;

  constructor(props: RxFormProps<GroupType>) {
    super(props);
    this.state = {
      progress: false,
      groupState: null
    };
    this.#submitCallback = () => this.#onSubmit();
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
    let { group, children, noValidate, className, onSubmit, ...attrs } = propsWithDefaults(this.props, { noValidate: true });
    let { progress, groupState } = this.state;
    let contextState: RxFormGroupContextState<GroupType> = { progress, ...groupState! };

    return <form noValidate={noValidate} onSubmit={this.#submitCallback} {...attrs}>
      <RxFormGroupContext.Provider value={[contextState, group]}>
        {typeof children === 'function' ? children(contextState) : children}
      </RxFormGroupContext.Provider>
    </form>;
  }

  #onSubmit(): void {
    let { group, onSubmit } = this.props;
    let submitResult = onSubmit(group.value);

    this.#progressSubscription = of(null)
      .pipe(
        tap(() => this.setState({ progress: true })),
        switchMap(() => submitResult ?? of(submitResult)),
        tap(() => this.setState({ progress: false }))
      )
      .subscribe();
  }

  #updateGroupStateSubscription(): void {
    this.#stateSubscription.unsubscribe();
    this.#stateSubscription = this.props.group.state$.subscribe(groupState => this.setState({ groupState }));
  }

}
