import { ConflictException } from '@nestjs/common';

export class UniqueHypothesisExpressionException extends ConflictException {
  public constructor() {
    super('The hypotheses in a statement should be unique');
  }
};
