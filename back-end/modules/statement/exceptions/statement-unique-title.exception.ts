import { ConflictException } from '@nestjs/common';

export class StatementUniqueTitleException extends ConflictException {
  constructor() {
    super('Statements in the same system must have a unique title.');
  }
};
