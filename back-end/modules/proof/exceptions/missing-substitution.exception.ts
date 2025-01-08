import { UnprocessableEntityException } from '@nestjs/common';

export class MissingSubstitutionException extends UnprocessableEntityException {
  constructor() {
    super('At least one substitution is missing.');
  }
};
