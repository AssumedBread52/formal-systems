import { ConflictException } from '@nestjs/common';

export class UniqueNameException extends ConflictException {
  public constructor() {
    super('Symbols in the same system must have a unique name');
  }
};
