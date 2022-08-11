import {
  FormEvent,
  FormHTMLAttributes,
  forwardRef,
  ReactNode,
  RefAttributes,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { filter, from, Observable, of, Subscription, switchMap, take, tap } from 'rxjs';
import { isFunction } from 'value-guards';
import { useFunction, useOnce } from 'react-cool-hooks';
import { useObservable } from 'react-rx-tools';

import type { CustomComponent } from '../types';
import { RxFormContext, RxFormContextState } from '../contexts';
import { RxFormGroup } from '../core';
import { classNames } from '../helpers';


type RxFormProps<GroupType extends Record<string, any> = Record<string, any>> = Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> & {
  formGroup: RxFormGroup<GroupType>;
  children: ReactNode | {
    (state: RxFormContextState<GroupType>): ReactNode;
  };
  onSubmit?(value: GroupType): void | Promise<any> | Observable<any>;
};

export const RxForm = forwardRef<HTMLFormElement, RxFormProps>((props, forwardedRef) => {
  const { formGroup, children, className, onSubmit, ...attrs } = props;
  const subscriptions = useOnce(() => ({ progressSubscription: Subscription.EMPTY }));
  const [progress, setProgress] = useState(false);
  const { value, dirty, touched, error, valid } = useObservable(formGroup.state$)!;
  const contextState = useMemo(() => {
    return { progress, value, dirty, touched, error, valid };
  }, [progress, value, dirty, touched, error, valid]);
  const cssClasses = useMemo(() => classNames({
    'rx-form-progress': progress,
    'rx-form-valid': valid,
    'rx-form-invalid': !valid,
    'rx-form-dirty': dirty,
    'rx-form-touched': touched,
  }), [progress, value, dirty, touched, error, valid]);

  const onSubmitHandler = useFunction((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    subscriptions.progressSubscription.unsubscribe();
    subscriptions.progressSubscription = of(null)
      .pipe(
        filter(() => formGroup.valid),
        tap(() => setProgress(true)),
        switchMap(() => {
          if (isFunction(onSubmit)) {
            const result = onSubmit(formGroup.value);

            return result ? from(result).pipe(take(1)) : of(null);
          }

          return of(null);
        }),
        tap(() => setProgress(false)),
      )
      .subscribe();
  });

  useEffect(() => {
    return () => subscriptions.progressSubscription.unsubscribe();
  }, []);

  return <form {...attrs} ref={forwardedRef} className={classNames(className, cssClasses)} onSubmit={onSubmitHandler}>
    <RxFormContext.Provider value={[contextState, formGroup]}>
      {isFunction(children) ? children(contextState) : children}
    </RxFormContext.Provider>
  </form>;
}) as unknown as CustomComponent<{
  <GroupType>(props: RxFormProps<GroupType> & RefAttributes<HTMLFormElement>): JSX.Element;
}>;

RxForm.displayName = 'RxForm';
