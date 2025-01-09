import { UnprocessableEntityException } from '@nestjs/common';

export class DistinctVariableRestrictionViolationException extends UnprocessableEntityException {
  constructor() {
    super('A distinct variable restriction was violated.');
  }
};
