import { RxFormControl, RxFormControlError, RxFormControlValidator } from '../core';

/**
 * Ported from Angular
 * [Original](https://github.com/angular/angular/blob/master/packages/forms/src/validators.ts)
 */
const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export default ((control: RxFormControl<string>): RxFormControlError => {
  return EMAIL_REGEXP.test(control.value) ? null : { validatorName: 'email' };
}) as RxFormControlValidator<string>;
