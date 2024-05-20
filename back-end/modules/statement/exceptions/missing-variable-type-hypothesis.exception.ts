import { UnprocessableEntityException } from '@nestjs/common';

export class MissingVariableTypeHypothesisException extends UnprocessableEntityException {
  constructor() {
    super('All variable symbols in any logical hypothesis or the assertion must have a corresponding variable type hypothesis.');
  }
};
