import { ConflictException } from '@nestjs/common';

export class UniqueTitleException extends ConflictException {
  public constructor() {
    super('Statements in the same system must have a unique title');
  }
};
