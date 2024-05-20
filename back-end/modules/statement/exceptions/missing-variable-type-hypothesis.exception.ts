import { UnprocessableEntityException } from '@nestjs/common';

export class MissingVariableTypeHypothesisException extends UnprocessableEntityException {
  constructor() {
    super('All variable symbols in all logical hypotheses and the assertion must have a corresponding variable type hypothesis.');
  }
};
