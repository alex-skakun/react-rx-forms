export type RxFormControlError = null | {
  validatorName: string;
  details?: Record<string, unknown>;
};
