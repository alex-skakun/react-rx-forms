import { FocusEvent, FormEvent, RefAttributes, TextareaHTMLAttributes } from 'react';
import { useFunction } from 'react-cool-hooks';
import {
  RxFormControlNameProps,
  RxFormSingleControlProps,
  RxFormStandaloneControlProps,
  rxFormValueAccessor,
} from '../core';
import { classNames } from '../helpers';
import { CustomComponent } from '../types/CustomComponent';


type RxTextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'disabled'>;

export const RxTextArea = rxFormValueAccessor<RxTextAreaProps, string, HTMLTextAreaElement>((props, context) => {
  const { className, onInput, onBlur, ...attrs } = props;
  const { model, ref, disabled, cssClasses, setModel, markAsTouched } = context;

  const onInputHandler = useFunction((event: FormEvent<HTMLTextAreaElement>) => {
    setModel(event.currentTarget.value);
    onInput && onInput(event);
  });

  const onBlurHandler = useFunction((event: FocusEvent<HTMLTextAreaElement>) => {
    markAsTouched();
    onBlur && onBlur(event);
  });

  return <textarea
    {...attrs}
    ref={ref}
    value={model}
    disabled={disabled}
    className={classNames(className, cssClasses)}
    onInput={onInputHandler}
    onBlur={onBlurHandler}
  />;
}) as CustomComponent<{
  (props: RxFormControlNameProps & RxTextAreaProps & RefAttributes<HTMLInputElement>): JSX.Element;
  (props: RxFormSingleControlProps<string> & RxTextAreaProps & RefAttributes<HTMLInputElement>): JSX.Element;
  (props: RxFormStandaloneControlProps<string> & RxTextAreaProps & RefAttributes<HTMLInputElement>): JSX.Element;
}>;

RxTextArea.displayName = 'RxTextArea';
