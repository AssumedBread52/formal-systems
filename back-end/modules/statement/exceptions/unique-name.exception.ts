import { ConflictException } from '@nestjs/common';

export class UniqueNameException extends ConflictException {
  public constructor() {
    super('Statement in a system must have a unique name');
  }
};
