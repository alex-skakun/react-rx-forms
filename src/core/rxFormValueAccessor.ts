import { ForwardedRef, forwardRef, ReactElement, RefAttributes, RefObject, useMemo } from 'react';
import { useObservable, useSubscription } from 'react-rx-tools';
import { RxFormControlContextType } from '../contexts';
import { classNames } from '../helpers';
import { useRxFormControl, useRxFormGroupContext } from '../hooks';
import { Validators } from '../validators';
import { RxFormControl, RxFormControlState } from './RxFormControl';
import { RxFormControlError } from './RxFormControlError';
import { useFunction } from 'react-cool-hooks';


export type RxFormControlNameProps = {
  formControlName: string;
  disabled?: boolean;
};

export type RxFormSingleControlProps<Value> = {
  formControl: RxFormControl<Value>;
  disabled?: boolean;
};

export type RxFormStandaloneControlProps<Value> = {
  model: Value;
  modelChange?: (value: Value) => void;
  onError?: (error: RxFormControlError) => void;
  disabled?: boolean;
};

type RxFormControlComponent<Props, Value, Ref> = {
  (props: RxFormControlNameProps & Props & RefAttributes<Ref>): ReactElement | null;
  (props: RxFormSingleControlProps<Value> & Props & RefAttributes<Ref>): ReactElement | null;
  (props: RxFormStandaloneControlProps<Value> & Props & RefAttributes<Ref>): ReactElement | null;
};

type ComponentWithRxFormControlContext<Props, Value, Ref extends Element> = (
  props: Props,
  context: RxFormControlContextType<Value, Ref>,
) => ReactElement;

export function rxFormValueAccessor<Props, Value, Ref extends Element = Element>(
  component: ComponentWithRxFormControlContext<Props, Value, Ref>,
): RxFormControlComponent<Props, Value, Ref> {
  return forwardRef<Ref>((props, ref) => {
    if (isPropsOfControlName<Props>(props)) {
      return renderAsFormControlName(props, component, ref);
    }

    if (isPropsOfSingleControl<Props, Value>(props)) {
      return renderAsSingleControl(props, component, ref);
    }

    if (isPropsOfStandaloneControl<Props, Value>(props)) {
      return renderAsStandaloneControl(props, component, ref);
    }

    return null;
  }) as RxFormControlComponent<Props, Value, Ref>;
}

function isPropsOfControlName<Props>(props: any): props is RxFormControlNameProps & Props {
  return !!props.formControlName;
}

function isPropsOfSingleControl<Props, Value>(props: any): props is RxFormSingleControlProps<Value> & Props {
  return props.formControl instanceof RxFormControl;
}

function isPropsOfStandaloneControl<Props, Value>(props: any): props is RxFormStandaloneControlProps<Value> & Props {
  return true;
}

function renderAsFormControlName<Props, Value, Ref extends Element>(
  props: RxFormControlNameProps & Props,
  component: ComponentWithRxFormControlContext<Props, Value, Ref>,
  ref: ForwardedRef<Ref>,
): ReactElement | null {
  const { formControlName, disabled, ...restProps } = props;
  const [, group] = useRxFormGroupContext<{ [key: string]: Value }>();

  if (!group) {
    throw new Error(`RxFormControl with property "formControlName" may be used only inside RxForm component.`);
  }

  const control = group.controls[formControlName] as RxFormControl<Value>;

  if (!control) {
    throw new Error(`Can't find control by name "${formControlName}".`);
  }

  const context = prepareContext(control, ref, disabled);

  return component(restProps as unknown as Props, context);
}

function renderAsSingleControl<Props, Value, Ref extends Element>(
  props: RxFormSingleControlProps<Value>,
  component: ComponentWithRxFormControlContext<Props, Value, Ref>,
  ref: ForwardedRef<Ref>,
): ReactElement | null {
  const { formControl: control, disabled, ...restProps } = props;

  if (!(control instanceof RxFormControl)) {
    throw new Error(`Incorrect value of property "FormControl", is must be an instance of ${RxFormControl.name}`);
  }

  const context = prepareContext(control, ref, disabled);

  return component(restProps as unknown as Props, context);
}

function renderAsStandaloneControl<Props, Value, Ref extends Element>(
  props: RxFormStandaloneControlProps<Value>,
  component: ComponentWithRxFormControlContext<Props, Value, Ref>,
  ref: ForwardedRef<Ref>,
): ReactElement | null {
  const { model, disabled, modelChange, onError, ...restProps } = props;
  const control = useRxFormControl<Value>([model, Validators.native(() => ref as RefObject<Element>)]);
  const internalOnModelChange = useFunction((value: Value): void => {
    modelChange?.(value);
  });
  const internalOnError = useFunction((error: RxFormControlError): void => {
    onError?.(error);
  });

  useSubscription(() => control.value$.subscribe(value => {
    internalOnModelChange(value);
  }));

  useSubscription(() => control.error$.subscribe(error => {
    internalOnError(error);
  }));

  control.setValue(model);

  const context = prepareContext(control, ref, disabled);

  return component(restProps as unknown as Props, context);
}

function prepareContext<Value, Ref extends Element>(
  control: RxFormControl<Value>,
  ref: ForwardedRef<Ref>,
  disabled?: boolean,
): RxFormControlContextType<Value, Ref> {
  const { value: model, dirty, touched, error, valid } = useObservable(control.state$)!;
  const setModel = useFunction((newModel: Value) => control.setValue(newModel));
  const markAsTouched = useFunction(() => control.markAsTouched());

  return useMemo(() => ({
    model,
    dirty,
    touched,
    error,
    valid,
    ref,
    disabled: !!disabled,
    cssClasses: getCssClasses({ dirty, touched, valid }),
    setModel,
    markAsTouched,
  }), [model, dirty, touched, error, valid, disabled, ref]);
}

function getCssClasses<Value>(controlState: Partial<RxFormControlState<Value>>): string {
  return classNames({
    'rx-control-valid': controlState.valid,
    'rx-control-invalid': !controlState.valid,
    'rx-control-dirty': controlState.dirty,
    'rx-control-touched': controlState.touched,
  });
}
