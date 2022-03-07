import React, { ChangeEvent, FocusEvent, SelectHTMLAttributes, useCallback } from 'react';
import { classNames } from '../helpers';
import { rxFormValueAccessor } from '../wrappers';


type RxSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'disabled'>;

export const RxSelect = rxFormValueAccessor<RxSelectProps, string, HTMLSelectElement>((props, context) => {
  let { className, onChange, onBlur, children, ...attrs } = props;
  let { value, ref, disabled, cssClasses, setValue, markAsTouched } = context;
  let onChangeHandler = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setValue(event.currentTarget.value);
    onChange && onChange(event);
  }, [setValue, onChange]);
  let onBlurHandler = useCallback((event: FocusEvent<HTMLSelectElement>) => {
    markAsTouched();
    onBlur && onBlur(event);
  }, [markAsTouched, onBlur]);

  return <select
    {...attrs}
    ref={ref}
    value={value}
    disabled={disabled}
    className={classNames(className, cssClasses)}
    onChange={onChangeHandler}
    onBlur={onBlurHandler}
  >{children}</select>;
});
