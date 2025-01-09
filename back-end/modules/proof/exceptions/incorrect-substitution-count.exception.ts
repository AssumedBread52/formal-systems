import { UnprocessableEntityException } from '@nestjs/common';

export class IncorrectSubstitutionCountException extends UnprocessableEntityException {
  constructor() {
    super('There should be precisely as many substitutions as there are variable type hypotheses.');
  }
};
