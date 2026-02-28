import { ConflictException } from '@nestjs/common';

export class UniqueSequenceException extends ConflictException {
  public constructor() {
    super('Expressions in the same system must have a unique sequence of symbols');
  }
};
