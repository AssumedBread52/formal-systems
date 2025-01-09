import { UnprocessableEntityException } from '@nestjs/common';

export class MissingLogicalHypothesisException extends UnprocessableEntityException {
  constructor() {
    super('The closure does not contain a required logical hypothesis.');
  }
};
