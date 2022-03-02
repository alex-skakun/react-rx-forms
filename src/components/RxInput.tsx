import React, { FormEvent, ForwardedRef, RefObject, useCallback, useRef } from 'react';
import { classNames } from '../helpers';
import { useRxFormControl } from '../hooks';
import { rxFormValueAccessor } from '../wrappers';


type RxInputProps = {
  type?: string;
  className?: string;
  ref?: RefObject<HTMLInputElement | undefined>;
};

export const RxInput = rxFormValueAccessor<RxInputProps, string>((props, context) => {
  let { type, className } = props;
  let { value, ref, disabled, cssClasses, setValue, markAsTouched } = context;
  let onInput = useCallback((event: FormEvent<HTMLInputElement>) => setValue(event.currentTarget.value), [setValue]);

  return <input
    ref={ref as ForwardedRef<HTMLInputElement>}
    type={type}
    className={classNames(className, cssClasses)}
    value={value}
    disabled={disabled}
    onInput={onInput}
    onBlur={markAsTouched}
  />;
});

function Test() {
  const control = useRxFormControl('');
  const ref = useRef<HTMLInputElement>();

  return <RxInput formControl={control} ref={ref}/>;
}
