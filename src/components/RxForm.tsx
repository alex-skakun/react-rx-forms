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
  useState
} from 'react';
import { useObservable } from 'react-rx-tools';
import { Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { RxFormGroupContext, RxFormGroupContextState } from '../contexts';
import { classNames } from '../helpers';
import { RxFormGroup } from '../models';


type RxFormProps<GroupType = unknown> = Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> & {
  group: RxFormGroup<GroupType>;
  children: ReactNode | {
    (state: RxFormGroupContextState<GroupType>): ReactNode;
  };
  onSubmit?(value: GroupType): void | Promise<any> | Observable<any>;
};

export const RxForm = forwardRef<HTMLFormElement, RxFormProps>((props, ref) => {
  let subscriptions = useMemo(() => ({ progressSubscription: Subscription.EMPTY }), []);
  let { group, children, className, onSubmit, ...attrs } = props;
  let [progress, setProgress] = useState(false);
  let groupState = useObservable(group.state$)!;
  let contextState = useMemo(() => ({ progress, ...groupState }), [progress, groupState]);
  let cssClasses = useMemo(() => classNames({
    'rx-form-valid': groupState!.valid,
    'rx-form-invalid': !groupState!.valid,
    'rx-form-dirty': groupState!.dirty,
    'rx-form-touched': groupState!.touched
  }), [groupState]);
  let onSubmitHandler = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (onSubmit) {
      let submitResult = onSubmit(group.value);

      subscriptions.progressSubscription.unsubscribe();
      subscriptions.progressSubscription = of(null)
        .pipe(
          tap(() => setProgress(true)),
          switchMap(() => submitResult ?? of(submitResult)),
          tap(() => setProgress(false))
        )
        .subscribe();
    }
  }, [onSubmit, group]);

  useEffect(() => {
    return () => subscriptions.progressSubscription.unsubscribe();
  });

  return <form {...attrs} ref={ref} className={classNames(className, cssClasses)} onSubmit={onSubmitHandler}>
    <RxFormGroupContext.Provider value={[contextState, group]}>
      {typeof children === 'function' ? children(contextState) : children}
    </RxFormGroupContext.Provider>
  </form>;
}) as unknown as (<GroupType>(props: RxFormProps<GroupType> & RefAttributes<HTMLFormElement>) => ReactElement | null);
