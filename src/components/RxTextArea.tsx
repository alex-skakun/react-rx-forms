import React, { FocusEvent, FormEvent, TextareaHTMLAttributes, useCallback } from 'react';
import { rxFormValueAccessor } from '../core';
import { classNames } from '../helpers';


type RxTextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'disabled'>;

export const RxTextArea = rxFormValueAccessor<RxTextAreaProps, string, HTMLTextAreaElement>((props, context) => {
  const { className, onInput, onBlur, ...attrs } = props;
  const { model, ref, disabled, cssClasses, setModel, markAsTouched } = context;

  const onInputHandler = useCallback((event: FormEvent<HTMLTextAreaElement>) => {
    setModel(event.currentTarget.value);
    onInput && onInput(event);
  }, [setModel, onInput]);

  const onBlurHandler = useCallback((event: FocusEvent<HTMLTextAreaElement>) => {
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
