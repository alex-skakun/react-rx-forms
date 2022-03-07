import React, { FocusEvent, FormEvent, TextareaHTMLAttributes, useCallback } from 'react';
import { classNames } from '../helpers';
import { rxFormValueAccessor } from '../wrappers';


type RxTextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'disabled'>;

export const RxTextArea = rxFormValueAccessor<RxTextAreaProps, string, HTMLTextAreaElement>((props, context) => {
  let { className, onInput, onBlur, ...attrs } = props;
  let { value, ref, disabled, cssClasses, setValue, markAsTouched } = context;
  let onInputHandler = useCallback((event: FormEvent<HTMLTextAreaElement>) => {
    setValue(event.currentTarget.value);
    onInput && onInput(event);
  }, [setValue, onInput]);
  let onBlurHandler = useCallback((event: FocusEvent<HTMLTextAreaElement>) => {
    markAsTouched();
    onBlur && onBlur(event);
  }, [markAsTouched, onBlur]);

  return <textarea
    {...attrs}
    ref={ref}
    value={value}
    disabled={disabled}
    className={classNames(className, cssClasses)}
    onInput={onInputHandler}
    onBlur={onBlurHandler}
  />;
});
