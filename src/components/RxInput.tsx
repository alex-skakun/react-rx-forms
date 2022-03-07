import React, { FocusEvent, FormEvent, InputHTMLAttributes, useCallback } from 'react';
import { classNames } from '../helpers';
import { rxFormValueAccessor } from '../wrappers';


type RxInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'disabled'>;

export const RxInput = rxFormValueAccessor<RxInputProps, string, HTMLInputElement>((props, context) => {
  let { className, onInput, onBlur, ...attrs } = props;
  let { value, ref, disabled, cssClasses, setValue, markAsTouched } = context;
  let onInputHandler = useCallback((event: FormEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.value);
    onInput && onInput(event);
  }, [setValue, onInput]);
  let onBlurHandler = useCallback((event: FocusEvent<HTMLInputElement>) => {
    markAsTouched();
    onBlur && onBlur(event);
  }, [markAsTouched, onBlur]);

  return <input
    {...attrs}
    ref={ref}
    value={value}
    disabled={disabled}
    className={classNames(className, cssClasses)}
    onInput={onInputHandler}
    onBlur={onBlurHandler}
  />;
});