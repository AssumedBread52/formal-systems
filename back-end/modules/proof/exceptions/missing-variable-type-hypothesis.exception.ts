import { UnprocessableEntityException } from '@nestjs/common';

export class MissingVariableTypeHypothesisException extends UnprocessableEntityException {
  constructor() {
    super('The closure does not contain a required variable type hypothesis.');
  }
};
