import { UnprocessableEntityException } from '@nestjs/common';

export class InvalidSubstitutionException extends UnprocessableEntityException {
  constructor() {
    super('A substitution maps from a variable symbol to an expression.');
  }
};
