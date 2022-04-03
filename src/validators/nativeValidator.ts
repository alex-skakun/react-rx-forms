import { RefObject } from 'react';
import { RxFormControl, RxFormControlError, RxFormControlValidator } from '../core';


export default ((getRef: () => RefObject<Element>) => (_control: RxFormControl<any>): RxFormControlError => {
  let current = getRef().current;
  let isInput = [HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement].some(Contructor => current instanceof Contructor);

  if (!isInput) {
    return null;
  }

  let validity = (current as HTMLInputElement).validity;

  if (!validity) {
    return null;
  }

  return validity.valid ? null : {
    validatorName: 'native',
    details: {
      valid: validity.valid,
      badInput: validity.badInput,
      customError: validity.customError,
      patternMismatch: validity.patternMismatch,
      rangeOverflow: validity.rangeOverflow,
      rangeUnderflow: validity.rangeUnderflow,
      stepMismatch: validity.stepMismatch,
      tooLong: validity.tooLong,
      tooShort: validity.tooShort,
      typeMismatch: validity.typeMismatch,
      valueMissing: validity.valueMissing
    }
  };
}) as (getRef: () => RefObject<Element>) => RxFormControlValidator<any>;
