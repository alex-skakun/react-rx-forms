import { ForwardedRef, forwardRef, ReactElement, RefAttributes, useCallback, useMemo, useState } from 'react';
import { useObservable } from 'react-rx-tools';
import { RxFormControlContextType } from '../contexts';
import { RxFormControl, RxFormControlState } from '../core';
import { classNames, isNotEmptyValue } from '../helpers';
import { useRxFormGroupContext } from '../hooks';


export type RxFormControlNameProps = {
  formControlName: string;
  disabled?: boolean;
};

export type RxFormSingleControlProps<V> = {
  formControl: RxFormControl<V>;
  disabled?: boolean;
};

export type RxFormStandaloneControlProps<V> = {
  disabled?: boolean;
  model: V;
  modelChange: (value: V) => void;
};

type RxFormControlComponent<P, V, R> = {
  (props: RxFormControlNameProps & P & RefAttributes<R>): ReactElement | null;
  (props: RxFormSingleControlProps<V> & P & RefAttributes<R>): ReactElement | null;
  (props: RxFormStandaloneControlProps<V> & P & RefAttributes<R>): ReactElement | null;
};

type ComponentWithRxFormControlContext<P, V, R extends Element> = (props: P, context: RxFormControlContextType<V, R>) => ReactElement;

export function rxFormValueAccessor<P, V, R extends Element = Element>(
  component: ComponentWithRxFormControlContext<P, V, R>
): RxFormControlComponent<P, V, R> {
  return forwardRef<R>((props, ref) => {
    if (isPropsOfControlName<P>(props)) {
      return renderAsFormControlName(props, component, ref);
    }

    if (isPropsOfSingleControl<P, V>(props)) {
      return renderAsSingleControl(props, component, ref);
    }

    if (isPropsOfStandaloneControl<P, V>(props)) {
      return renderAsStandaloneControl(props, component, ref);
    }

    return null;
  }) as RxFormControlComponent<P, V, R>;
}

function isPropsOfControlName<P>(props: any): props is RxFormControlNameProps & P {
  return !!props.formControlName;
}

function isPropsOfSingleControl<P, V>(props: any): props is RxFormSingleControlProps<V> & P {
  return props.formControl instanceof RxFormControl;
}

function isPropsOfStandaloneControl<P, V>(props: any): props is RxFormStandaloneControlProps<V> & P {
  return true;
}

function renderAsFormControlName<P, V, R extends Element>(
  props: RxFormControlNameProps & P,
  component: ComponentWithRxFormControlContext<P, V, R>,
  ref: ForwardedRef<R>
): ReactElement | null {
  let { formControlName, disabled, ...restProps } = props;
  let [, group] = useRxFormGroupContext<{ [key: string]: V }>();

  if (!group) {
    throw new Error(`RxFormControl with property "formControlName" may be used only inside RxForm component.`);
  }

  let control = group.controls[formControlName] as RxFormControl<V>;

  if (!control) {
    throw new Error(`Can't find control by name "${formControlName}".`);
  }

  let context = prepareContext(control, ref, disabled);

  return component(restProps as unknown as P, context);
}

function renderAsSingleControl<P, V, R extends Element>(
  props: RxFormSingleControlProps<V>,
  component: ComponentWithRxFormControlContext<P, V, R>,
  ref: ForwardedRef<R>
): ReactElement | null {
  let { formControl: control, disabled, ...restProps } = props;

  if (!(control instanceof RxFormControl)) {
    throw new Error(`Incorrect value of property "FormControl", is must be an instance of ${RxFormControl.name}`);
  }

  let context = prepareContext(control, ref, disabled);

  return component(restProps as unknown as P, context);
}

function prepareContext<V, R extends Element>(
  control: RxFormControl<V>,
  ref: ForwardedRef<R>,
  disabled?: boolean
): RxFormControlContextType<V, R> {
  let { value: model, ...state } = useObservable(control.state$)!;
  let setValue = useCallback((value: V) => control.setValue(value), [control]);
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

function renderAsStandaloneControl<P, V, R extends Element>(
  props: RxFormStandaloneControlProps<V>,
  component: ComponentWithRxFormControlContext<P, V, R>,
  ref: ForwardedRef<R>
): ReactElement | null {
  let { model, disabled, modelChange, ...restProps } = props;
  let [touched, setTouched] = useState(false);
  let markAsTouched = useCallback(() => setTouched(true), []);
  let valid = true;
  let dirty = isNotEmptyValue(model);
  let context: RxFormControlContextType<V, R> = useMemo(() => ({
    model,
    touched,
    ref,
    disabled: !!disabled,
    valid,
    dirty,
    cssClasses: getCssClasses({ valid, dirty, touched }),
    setValue: modelChange,
    markAsTouched
  }), [model, touched, disabled, ref]);

  return component(restProps as unknown as P, context);
}

function getCssClasses<V>(controlState: Partial<RxFormControlState<V>>): string {
  return classNames({
    'rx-control-valid': controlState.valid,
    'rx-control-invalid': !controlState.valid,
    'rx-control-dirty': controlState.dirty,
    'rx-control-touched': controlState.touched
  });
}
