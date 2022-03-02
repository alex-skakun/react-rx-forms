import { RxFormControlValidator } from '../models';


/**
 * Ported from Angular
 * [Original](https://github.com/angular/angular/blob/master/packages/forms/src/validators.ts)
 */
const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export class Validators {

  /**
   * Checks that control value is valid email address.
   * Uses the same RegExp for testing as Angular.
   */
  static email: RxFormControlValidator<string> = (control) => {
    return EMAIL_REGEXP.test(control.value) ? null : { validatorName: 'email' };
  };

  /**
   * Checks that control value is provided.
   * For string values it checks string length.
   * For number values it checks that value is finite.
   * For boolean values always returns null. Use requiredTrue validator for boolean values.
   * For any other types of values it checks that they are not null or undefined.
   */
  static required: RxFormControlValidator<any> = (control) => {
    return control.dirty ? null : { validatorName: 'required' };
  };

  /**
   * Checks that boolean value equal to true.
   */
  static requiredTrue: RxFormControlValidator<boolean> = (control) => {
    return control.value ? null : { validatorName: 'requiredTrue' };
  };

  static min: <T extends number | string>(min: T) => RxFormControlValidator<T> = (minValue) => (control) => {
    return control.value >= minValue ? null : {
      validatorName: 'min',
      details: {
        actualValue: control.value,
        minValue
      }
    };
  };

  static max: <T extends number | string>(max: T) => RxFormControlValidator<T> = (maxValue) => (control) => {
    return control.value <= maxValue ? null : {
      validatorName: 'max',
      details: {
        actualValue: control.value,
        maxValue
      }
    };
  };

  static minLength: (length: number) => RxFormControlValidator<string> = (length) => (control) => {
    return control.value.length >= length ? null : {
      validatorName: 'minLength',
      details: {
        actualLength: control.value.length,
        minLength: length
      }
    };
  };

  static maxLength: (length: number) => RxFormControlValidator<string> = (length) => (control) => {
    return control.value.length <= length ? null : {
      validatorName: 'maxLength',
      details: {
        actualLength: control.value.length,
        maxLength: length
      }
    };
  };

  static pattern: (pattern: RegExp) => RxFormControlValidator<string> = (pattern) => (control) => {
    return pattern.test(control.value) ? null : {
      validatorName: 'pattern',
      details: { actualValue: control.value }
    };
  };

}
