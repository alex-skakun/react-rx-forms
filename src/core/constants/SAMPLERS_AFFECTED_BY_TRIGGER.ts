import { ControlSampler } from './ControlSampler';
import { ControlTrigger } from './ControlTrigger';

export const SAMPLERS_AFFECTED_BY_TRIGGER = {
  [ControlTrigger.VALUE]: {
    inSelf: [
      ControlSampler.STATE,
    ],
    inParent: [
      ControlSampler.VALUE,
      ControlSampler.DIRTY,
      ControlSampler.ERRORS,
      ControlSampler.STATE,
    ],
  },
  [ControlTrigger.VALIDATORS]: {
    inSelf: [
      ControlSampler.STATE,
    ],
    inParent: [
      ControlSampler.ERRORS,
      ControlSampler.STATE,
    ],
  },
  [ControlTrigger.CONTROLS]: {
    inSelf: [
      ControlSampler.ERRORS,
      ControlSampler.STATE,
    ],
    inParent: [
      ControlSampler.VALUE,
      ControlSampler.DIRTY,
      ControlSampler.ERRORS,
      ControlSampler.DISABLED,
      ControlSampler.TOUCHED,
      ControlSampler.STATE,
    ],
  },
  [ControlTrigger.DISABLED]: {
    inSelf: [
      ControlSampler.STATE,
    ],
    inParent: [
      ControlSampler.DISABLED,
      ControlSampler.STATE,
    ],
  },
  [ControlTrigger.TOUCHED]: {
    inSelf: [
      ControlSampler.STATE,
    ],
    inParent: [
      ControlSampler.TOUCHED,
      ControlSampler.STATE,
    ],
  },
} satisfies Record<ControlTrigger, {
  inSelf: ControlSampler[],
  inParent: ControlSampler[],
}>;
