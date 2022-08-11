import React, {
  ChangeEvent,
  FocusEvent,
  MutableRefObject,
  ReactElement,
  RefAttributes,
  SelectHTMLAttributes,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  RxFormControlNameProps,
  RxFormSingleControlProps,
  RxFormStandaloneControlProps,
  rxFormValueAccessor,
} from '../core';
import { classNames, fillDefaults } from '../helpers';
import { useFunction } from 'react-cool-hooks';
import { CustomComponent } from '../types/CustomComponent';


type RxSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'disabled'>;

export const RxSelect = rxFormValueAccessor<RxSelectProps, string | string[], HTMLSelectElement>((props, context) => {
  const { multiple, className, onChange, onBlur, children, ...attrs } = fillDefaults(props, { multiple: false });
  const { model, ref, disabled, cssClasses, setModel, markAsTouched } = context;
  const inputRef = useRef<HTMLSelectElement>(null);

  const onChangeHandler = useFunction((event: ChangeEvent<HTMLSelectElement>) => {
    if (multiple) {
      setModel(Array.from(event.currentTarget.selectedOptions, option => option.value));
    } else {
      setModel(event.currentTarget.value);
    }

    onChange && onChange(event);
  });

  const onBlurHandler = useFunction((event: FocusEvent<HTMLSelectElement>) => {
    markAsTouched();
    onBlur && onBlur(event);
  });

  useEffect(() => {
    if (inputRef) {
      const options = (inputRef as MutableRefObject<HTMLSelectElement>).current.options;
      const values = new Set<string>(Array.isArray(model) ? model : [model]);

      for (const option of options) {
        option.selected = values.has(option.value);
      }
    }
  }, [model, inputRef]);

  useImperativeHandle(ref, () => {
    return inputRef.current!;
  });

  return <select
    {...attrs}
    ref={inputRef}
    multiple={multiple}
    disabled={disabled}
    className={classNames(className, cssClasses)}
    onChange={onChangeHandler}
    onBlur={onBlurHandler}
  >{children}</select>;
}) as CustomComponent<{
  (props: RxFormControlNameProps & RxSelectProps & RefAttributes<HTMLSelectElement>): ReactElement;
  (props: { multiple: true } & RxFormSingleControlProps<string[]> & Omit<RxSelectProps, 'multiple'> & RefAttributes<HTMLSelectElement>): ReactElement;
  (props: { multiple: true } & RxFormStandaloneControlProps<string[]> & Omit<RxSelectProps, 'multiple'> & RefAttributes<HTMLSelectElement>): ReactElement;
  (props: { multiple?: false } & RxFormSingleControlProps<string> & Omit<RxSelectProps, 'multiple'> & RefAttributes<HTMLSelectElement>): ReactElement;
  (props: { multiple?: false } & RxFormStandaloneControlProps<string> & Omit<RxSelectProps, 'multiple'> & RefAttributes<HTMLSelectElement>): ReactElement;
}>;

RxSelect.displayName = 'RxSelect';
