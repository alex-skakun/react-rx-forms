import React, {
  ChangeEvent,
  FocusEvent,
  MutableRefObject,
  ReactElement,
  RefAttributes,
  SelectHTMLAttributes,
  useCallback,
  useEffect
} from 'react';
import { classNames, propsWithDefaults } from '../helpers';
import { RxFormControlNameProps, RxFormSingleControlProps, RxFormStandaloneControlProps, rxFormValueAccessor } from '../wrappers';


type RxSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'disabled'>;

export const RxSelect = rxFormValueAccessor<RxSelectProps, string | string[], HTMLSelectElement>((props, context) => {
  let { multiple, className, onChange, onBlur, children, ...attrs } = propsWithDefaults(props, { multiple: false });
  let { model, ref, disabled, cssClasses, setValue, markAsTouched } = context;
  let onChangeHandler = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    if (multiple) {
      setValue(Array.from(event.currentTarget.selectedOptions, option => option.value));
    } else {
      setValue(event.currentTarget.value);
    }

    onChange && onChange(event);
  }, [setValue, onChange]);
  let onBlurHandler = useCallback((event: FocusEvent<HTMLSelectElement>) => {
    markAsTouched();
    onBlur && onBlur(event);
  }, [markAsTouched, onBlur]);

  useEffect(() => {
    let options = (ref as MutableRefObject<HTMLSelectElement>).current.options;
    let values = new Set<string>(Array.isArray(model) ? model : [model]);

    for (let option of options) {
      option.selected = values.has(option.value);
    }
  }, [model, ref]);

  return <select
    {...attrs}
    ref={ref}
    multiple={multiple}
    disabled={disabled}
    className={classNames(className, cssClasses)}
    onChange={onChangeHandler}
    onBlur={onBlurHandler}
  >{children}</select>;
}) as {
  (props: RxFormControlNameProps & RxSelectProps & RefAttributes<HTMLSelectElement>): ReactElement;
  (props: { multiple: true } & RxFormSingleControlProps<string[]> & Omit<RxSelectProps, 'multiple'> & RefAttributes<HTMLSelectElement>): ReactElement;
  (props: { multiple: true } & RxFormStandaloneControlProps<string[]> & Omit<RxSelectProps, 'multiple'> & RefAttributes<HTMLSelectElement>): ReactElement;
  (props: { multiple?: false } & RxFormSingleControlProps<string> & Omit<RxSelectProps, 'multiple'> & RefAttributes<HTMLSelectElement>): ReactElement;
  (props: { multiple?: false } & RxFormStandaloneControlProps<string> & Omit<RxSelectProps, 'multiple'> & RefAttributes<HTMLSelectElement>): ReactElement;
};
