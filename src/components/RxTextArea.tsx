import React, { FocusEvent, FormEvent, TextareaHTMLAttributes, useCallback } from 'react';
import { rxFormValueAccessor } from '../core';
import { classNames } from '../helpers';


type RxTextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'disabled'>;

export const RxTextArea = rxFormValueAccessor<RxTextAreaProps, string, HTMLTextAreaElement>((props, context) => {
  let { className, onInput, onBlur, ...attrs } = props;
  let { model, ref, disabled, cssClasses, setValue, markAsTouched } = context;
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
    value={model}
    disabled={disabled}
    className={classNames(className, cssClasses)}
    onInput={onInputHandler}
    onBlur={onBlurHandler}
  />;
});
