import React, { FocusEvent, FormEvent, InputHTMLAttributes, ReactElement, RefAttributes, useCallback } from 'react';
import { classNames, propsWithDefaults } from '../helpers';
import { RxFormControlNameProps, RxFormSingleControlProps, RxFormStandaloneControlProps, rxFormValueAccessor } from '../wrappers';


type RxInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'disabled'>;
type RxInputNoTypeProps = Omit<RxInputProps, 'type'>;
type RxInputNoValueProps = Omit<RxInputProps, 'type' | 'value'>;
type StringInputType = 'button' | 'color' | 'date' | 'datetime-local' | 'email' | 'hidden' | 'image' | 'month' | 'password' | 'reset'
  | 'search' | 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week' | 'radio';

export const RxInput = rxFormValueAccessor<RxInputProps, unknown, HTMLInputElement>((props, context) => {
  let { type, value, className, onInput, onBlur, ...attrs } = propsWithDefaults(props, { type: 'text' });
  let { model, ref, disabled, cssClasses, setValue, markAsTouched } = context;
  let onInputHandler = useCallback((event: FormEvent<HTMLInputElement>) => {
    let newValue = getInputValue(event.currentTarget, type);

    if (type === 'radio') {
      event.currentTarget.checked && setValue(newValue);
    } else {
      setValue(newValue);
    }

    onInput && onInput(event);
  }, [setValue, onInput, type]);
  let onBlurHandler = useCallback((event: FocusEvent<HTMLInputElement>) => {
    markAsTouched();
    onBlur && onBlur(event);
  }, [markAsTouched, onBlur]);

  return <input
    {...attrs}
    ref={ref}
    {...getValueAttributes(model, value, type)}
    disabled={disabled}
    className={classNames(className, cssClasses)}
    onInput={onInputHandler}
    onBlur={onBlurHandler}
  />;
}) as {
  (props: RxFormControlNameProps & RxInputProps & RefAttributes<HTMLInputElement>): ReactElement;
  (props: RxFormSingleControlProps<string> & RxInputNoTypeProps & RefAttributes<HTMLInputElement>): ReactElement;
  (props: RxFormStandaloneControlProps<string> & RxInputNoTypeProps & RefAttributes<HTMLInputElement>): ReactElement;
  (props: { type: StringInputType } & RxFormSingleControlProps<string> & RxInputNoTypeProps & RefAttributes<HTMLInputElement>): ReactElement;
  (props: { type: StringInputType } & RxFormStandaloneControlProps<string> & RxInputNoTypeProps & RefAttributes<HTMLInputElement>): ReactElement;
  (props: { type: 'number' | 'range' } & RxFormSingleControlProps<number> & RxInputNoValueProps & RefAttributes<HTMLInputElement>): ReactElement;
  (props: { type: 'number' | 'range' } & RxFormStandaloneControlProps<number> & RxInputNoValueProps & RefAttributes<HTMLInputElement>): ReactElement;
  (props: { type: 'checkbox' } & RxFormSingleControlProps<boolean> & RxInputNoTypeProps & RefAttributes<HTMLInputElement>): ReactElement;
  (props: { type: 'checkbox' } & RxFormStandaloneControlProps<boolean> & RxInputNoTypeProps & RefAttributes<HTMLInputElement>): ReactElement;
  (props: { type: 'file' } & RxFormSingleControlProps<File[]> & RxInputNoValueProps & RefAttributes<HTMLInputElement>): ReactElement;
  (props: { type: 'file' } & RxFormStandaloneControlProps<File[]> & RxInputNoValueProps & RefAttributes<HTMLInputElement>): ReactElement;
};

function getValueAttributes(
  model: unknown,
  value: InputHTMLAttributes<HTMLInputElement>['value'],
  inputType: InputHTMLAttributes<HTMLInputElement>['type']
) {
  switch (inputType) {
  case 'radio':
    return { value, checked: model === value };
  case 'checkbox':
    return { value, checked: model as InputHTMLAttributes<HTMLInputElement>['checked'] };
  case 'file':
    return {};
  default:
    return { value: model as InputHTMLAttributes<HTMLInputElement>['value'] };
  }
}

function getInputValue(
  inputElement: HTMLInputElement,
  inputType: InputHTMLAttributes<HTMLInputElement>['type']
): number | boolean | string | Array<File> {
  switch (inputType) {
  case 'number':
  case 'range':
    return inputElement.valueAsNumber;
  case 'checkbox':
    return inputElement.checked;
  case 'file':
    return inputElement.files ? [...inputElement.files] : [];
  default:
    return inputElement.value;
  }
}
