import { ForwardedRef, forwardRef, ReactElement, useCallback, useMemo, useState } from 'react';
import { useObservable } from 'react-rx-tools';
import { RxFormControlContextType } from '../contexts';
import { classNames, isNotEmptyValue } from '../helpers';
import { useRxFormGroupContext } from '../hooks';
import { RxFormControl, RxFormControlState } from '../models';


type RxFormControlNameProps = {
  formControlName: string;
  disabled?: boolean;
};

type RxFormSingleControlProps<V> = {
  formControl: RxFormControl<V>;
  disabled?: boolean;
};

type RxFormStandaloneControlProps<V> = {
  disabled?: boolean;
  value: V;
  valueChange: (value: V) => void;
};

type RxFormControlComponent<P, V> = {
  (props: RxFormControlNameProps & P): ReactElement | null;
  (props: RxFormSingleControlProps<V> & P): ReactElement | null;
  (props: RxFormStandaloneControlProps<V> & P): ReactElement | null;
};

type RxFormValueAccessorProps<P, V> = P & RxFormStandaloneControlProps<V> & RxFormSingleControlProps<V> & RxFormControlNameProps;

type ComponentWithRxFormControlContext<P, V> = (props: P, context: RxFormControlContextType<V>) => ReactElement;

export function rxFormValueAccessor<P, V>(component: ComponentWithRxFormControlContext<P, V>): RxFormControlComponent<P, V> {
  return forwardRef<Element>((props, ref) => {
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
  }) as RxFormControlComponent<P, V>;
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

function renderAsFormControlName<P, V>(
  props: RxFormControlNameProps & P,
  component: ComponentWithRxFormControlContext<P, V>,
  ref: ForwardedRef<Element>
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

function renderAsSingleControl<P, V>(
  props: RxFormSingleControlProps<V>,
  component: ComponentWithRxFormControlContext<P, V>,
  ref: ForwardedRef<Element>
): ReactElement | null {
  let { formControl: control, disabled, ...restProps } = props;

  if (!(control instanceof RxFormControl)) {
    throw new Error(`Incorrect value of property "FormControl", is must be an instance of ${RxFormControl.name}`);
  }

  let context = prepareContext(control, ref, disabled);

  return component(restProps as unknown as P, context);
}

function prepareContext<V>(control: RxFormControl<V>, ref: ForwardedRef<Element>, disabled?: boolean): RxFormControlContextType<V> {
  let state = useObservable(control.state$)!;
  let setValue = useCallback((value: V) => control.setValue(value), [control]);
  let markAsTouched = useCallback(() => control.markAsTouched(), [control]);

  return useMemo(() => ({
    ...state,
    ref,
    disabled: !!disabled,
    cssClasses: getCssClasses(state),
    setValue,
    markAsTouched
  }), [state, disabled, ref]);
}

function renderAsStandaloneControl<P, V>(
  props: RxFormStandaloneControlProps<V>,
  component: ComponentWithRxFormControlContext<P, V>,
  ref: ForwardedRef<Element>
): ReactElement | null {
  let { value, disabled, valueChange, ...restProps } = props;
  let [touched, setTouched] = useState(false);
  let markAsTouched = useCallback(() => setTouched(true), []);
  let valid = true;
  let dirty = isNotEmptyValue(value);
  let context: RxFormControlContextType<V> = useMemo(() => ({
    value,
    touched,
    ref,
    disabled: !!disabled,
    valid,
    dirty,
    cssClasses: getCssClasses({ valid, dirty, touched }),
    setValue: valueChange,
    markAsTouched
  }), [value, touched, disabled, ref]);

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
