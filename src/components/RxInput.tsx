import React, {
  ChangeEvent,
  FocusEvent,
  FormEvent,
  InputHTMLAttributes,
  ReactElement,
  RefAttributes,
  useCallback,
} from 'react';
import {
  RxFormControlNameProps,
  RxFormSingleControlProps,
  RxFormStandaloneControlProps,
  rxFormValueAccessor,
} from '../core';
import { classNames, propsWithDefaults } from '../helpers';


type RxInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'disabled'>;
type RxInputNoTypeProps = Omit<RxInputProps, 'type'>;
type RxInputNoValueProps = Omit<RxInputProps, 'type' | 'value'>;
type StringInputType =
  'button'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'hidden'
  | 'image'
  | 'month'
  | 'password'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week'
  | 'radio';

export const RxInput = rxFormValueAccessor<RxInputProps, unknown, HTMLInputElement>((props, context) => {
  const { type, value, className, onInput, onBlur, onChange, ...attrs } = propsWithDefaults(props, { type: 'text' });
  const { model, ref, disabled, cssClasses, setModel, markAsTouched } = context;

  const onChangeHandler = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const newValue = getInputValue(event.currentTarget, type);

    if (type === 'radio' && event.currentTarget.checked) {
      setModel(newValue);
    } else if (type === 'checkbox') {
      setModel(newValue);
    }

    onChange && onChange(event);
  }, [setModel, onChange, type]);

  const onInputHandler = useCallback((event: FormEvent<HTMLInputElement>) => {
    if (type !== 'radio' && type !== 'checkbox') {
      setModel(getInputValue(event.currentTarget, type));
    }

    onInput && onInput(event);
  }, [setModel, onInput, type]);

  const onBlurHandler = useCallback((event: FocusEvent<HTMLInputElement>) => {
    markAsTouched();
    onBlur && onBlur(event);
  }, [markAsTouched, onBlur]);

  return <input
    type={type}
    ref={ref}
    {...attrs}
    {...getValueAttributes(model, value, type)}
    disabled={disabled}
    className={classNames(className, cssClasses)}
    onChange={onChangeHandler}
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
  inputType: InputHTMLAttributes<HTMLInputElement>['type'],
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
  inputType: InputHTMLAttributes<HTMLInputElement>['type'],
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
