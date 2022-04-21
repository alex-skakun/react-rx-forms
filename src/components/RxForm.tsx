import React, {
  FormEvent,
  FormHTMLAttributes,
  forwardRef,
  ReactElement,
  ReactNode,
  RefAttributes,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useObservable } from 'react-rx-tools';
import { Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { RxFormContext, RxFormContextState } from '../contexts';
import { RxFormGroup } from '../core';
import { classNames } from '../helpers';


type RxFormProps<GroupType = unknown> = Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> & {
  formGroup: RxFormGroup<GroupType>;
  children: ReactNode | {
    (state: RxFormContextState<GroupType>): ReactNode;
  };
  onSubmit?(value: GroupType): void | Promise<any> | Observable<any>;
};

export const RxForm = forwardRef<HTMLFormElement, RxFormProps>((props, ref) => {
  const subscriptions = useMemo(() => ({ progressSubscription: Subscription.EMPTY }), []);
  const { formGroup, children, className, onSubmit, ...attrs } = props;
  const [progress, setProgress] = useState(false);
  const groupState = useObservable(formGroup.state$)!;
  const contextState = useMemo(() => ({ progress, ...groupState }), [progress, groupState]);
  const cssClasses = useMemo(() => classNames({
    'rx-form-valid': groupState.valid,
    'rx-form-invalid': !groupState.valid,
    'rx-form-dirty': groupState.dirty,
    'rx-form-touched': groupState.touched,
  }), [groupState]);

  const onSubmitHandler = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    subscriptions.progressSubscription.unsubscribe();
    subscriptions.progressSubscription = of(null)
      .pipe(
        tap(() => setProgress(true)),
        switchMap(() => (onSubmit && onSubmit(formGroup.value)) ?? of(null)),
        tap(() => setProgress(false)),
      )
      .subscribe();
  }, [onSubmit, formGroup]);

  useEffect(() => {
    return () => subscriptions.progressSubscription.unsubscribe();
  });

  return <form {...attrs} ref={ref} className={classNames(className, cssClasses)} onSubmit={onSubmitHandler}>
    <RxFormContext.Provider value={[contextState, formGroup]}>
      {typeof children === 'function' ? children(contextState) : children}
    </RxFormContext.Provider>
  </form>;
}) as unknown as {
  <GroupType>(props: RxFormProps<GroupType> & RefAttributes<HTMLFormElement>): ReactElement
};
