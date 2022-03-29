import { ForwardedRef, forwardRef, ReactElement, RefAttributes, useCallback, useEffect, useMemo, useState } from 'react';
import { isDefined, useObservable } from 'react-rx-tools';
import { RxFormControlContextType } from '../contexts';
import { classNames, isNotEmptyValue } from '../helpers';
import { useRxFormGroupContext } from '../hooks';
import { Validators } from '../validators';
import { RxFormControl, RxFormControlState } from './RxFormControl';


export type RxFormControlNameProps = {
  formControlName: string;
  disabled?: boolean;
};

export type RxFormSingleControlProps<Value> = {
  formControl: RxFormControl<Value>;
  disabled?: boolean;
};

export type RxFormStandaloneControlProps<Value> = {
  disabled?: boolean;
  model: Value;
  modelChange: (value: Value) => void;
};

type RxFormControlComponent<Props, Value, Ref> = {
  (props: RxFormControlNameProps & Props & RefAttributes<Ref>): ReactElement | null;
  (props: RxFormSingleControlProps<Value> & Props & RefAttributes<Ref>): ReactElement | null;
  (props: RxFormStandaloneControlProps<Value> & Props & RefAttributes<Ref>): ReactElement | null;
};

type ComponentWithRxFormControlContext<Props, Value, Ref extends Element> = (props: Props, context: RxFormControlContextType<Value, Ref>) => ReactElement;

export function rxFormValueAccessor<Props, Value, Ref extends Element = Element>(
  component: ComponentWithRxFormControlContext<Props, Value, Ref>
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
  ref: ForwardedRef<Ref>
): ReactElement | null {
  let { formControlName, disabled, ...restProps } = props;
  let [, group] = useRxFormGroupContext<{ [key: string]: Value }>();

  if (!group) {
    throw new Error(`RxFormControl with property "formControlName" may be used only inside RxForm component.`);
  }

  let control = group.controls[formControlName] as RxFormControl<Value>;

  if (!control) {
    throw new Error(`Can't find control by name "${formControlName}".`);
  }

  let context = prepareContext(control, ref, disabled);

  return component(restProps as unknown as Props, context);
}

function renderAsSingleControl<Props, Value, Ref extends Element>(
  props: RxFormSingleControlProps<Value>,
  component: ComponentWithRxFormControlContext<Props, Value, Ref>,
  ref: ForwardedRef<Ref>
): ReactElement | null {
  let { formControl: control, disabled, ...restProps } = props;

  if (!(control instanceof RxFormControl)) {
    throw new Error(`Incorrect value of property "FormControl", is must be an instance of ${RxFormControl.name}`);
  }

  let context = prepareContext(control, ref, disabled);

  return component(restProps as unknown as Props, context);
}

function prepareContext<Value, Ref extends Element>(
  control: RxFormControl<Value>,
  ref: ForwardedRef<Ref>,
  disabled?: boolean
): RxFormControlContextType<Value, Ref> {
  let { value: model, ...state } = useObservable(control.state$)!;
  let setValue = useCallback((value: Value) => control.setValue(value), [control]);
  let markAsTouched = useCallback(() => control.markAsTouched(), [control]);

  return useMemo(() => ({
    model,
    ...state,
    ref,
    disabled: !!disabled,
    cssClasses: getCssClasses(state),
    setValue,
    markAsTouched
  }), [state, disabled, ref]);
}

function renderAsStandaloneControl<Props, Value, Ref extends Element>(
  props: RxFormStandaloneControlProps<Value>,
  component: ComponentWithRxFormControlContext<Props, Value, Ref>,
  ref: ForwardedRef<Ref>
): ReactElement | null {
  let { model, disabled, modelChange, ...restProps } = props;
  let control = useMemo(() => new RxFormControl(model), []);

  control.setValue(model);

  useEffect(() => {
    let subscription = control.value$.subscribe(modelChange);

    return () => subscription.unsubscribe();
  }, [modelChange]);

  let context = prepareContext(control, ref, disabled);

  return component(restProps as unknown as Props, context);
}

function getCssClasses<Value>(controlState: Partial<RxFormControlState<Value>>): string {
  return classNames({
    'rx-control-valid': controlState.valid,
    'rx-control-invalid': !controlState.valid,
    'rx-control-dirty': controlState.dirty,
    'rx-control-touched': controlState.touched
  });
}
