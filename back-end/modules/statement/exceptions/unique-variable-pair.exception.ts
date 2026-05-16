import { ConflictException } from '@nestjs/common';

export class UniqueVariablePairException extends ConflictException {
  public constructor() {
    super('Distinct variable pairs attached to a statement must be unique');
  }
};
