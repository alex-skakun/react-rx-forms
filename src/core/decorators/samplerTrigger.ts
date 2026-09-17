import { ControlSampler, ControlTrigger, SAMPLERS_AFFECTED_BY_TRIGGER } from '../constants';
import { RxFormAbstractControl } from '../RxFormAbstractControl';
import { DISABLED_SAMPLERS, TRIGGER_SAMPLER } from '../tokens';

export interface StateSamplerTriggerOptions {
  trigger: ControlTrigger;
  override?: ControlSampler[];
}

export function samplerTrigger(options: StateSamplerTriggerOptions) {
  return <ValueType, Args extends any[] = any[], Result = any>(
    originalMethod: (this: RxFormAbstractControl<ValueType>, ...args: Args) => Result,
    _context: ClassMethodDecoratorContext<
      RxFormAbstractControl<ValueType>,
      (this: RxFormAbstractControl<ValueType>, ...args: Args) => Result
    >,
  ) => {
    return function (this: RxFormAbstractControl<ValueType>, ...args: Args): Result {
      if (Array.isArray(options.override)) {
        options.override.forEach((sampler) => this[DISABLED_SAMPLERS].add(sampler));
      }

      const { inSelf, inParent } = SAMPLERS_AFFECTED_BY_TRIGGER[options.trigger];
      const originalResult = originalMethod.apply(this, args);

      this[TRIGGER_SAMPLER](inSelf, inParent);

      if (Array.isArray(options.override)) {
        options.override.forEach((sampler) => this[DISABLED_SAMPLERS].delete(sampler));
        this[TRIGGER_SAMPLER](options.override);
      }

      return originalResult;
    };
  }
}
