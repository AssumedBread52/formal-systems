import { ConflictException } from '@nestjs/common';

export class UniqueSymbolSequenceException extends ConflictException {
  public constructor() {
    super('Expressions in the same system must have a unique sequence of symbols');
  }
};
