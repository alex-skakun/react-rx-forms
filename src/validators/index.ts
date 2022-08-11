import emailValidator from './emailValidator';
import maxLengthValidator from './maxLengthValidator';
import { max } from './maxValidator';
import minLengthValidator from './minLengthValidator';
import minValidator from './minValidator';
import nativeValidator from './nativeValidator';
import patternValidator from './patternValidator';
import requiredTrueValidator from './requiredTrueValidator';
import requiredValidator from './requiredValidator';


export class Validators {
  static readonly email = emailValidator;
  static readonly required = requiredValidator;
  static readonly requiredTrue = requiredTrueValidator;
  static readonly min = minValidator;
  static readonly max = max;
  static readonly minLength = minLengthValidator;
  static readonly maxLength = maxLengthValidator;
  static readonly pattern = patternValidator;
  static readonly native = nativeValidator;
}
