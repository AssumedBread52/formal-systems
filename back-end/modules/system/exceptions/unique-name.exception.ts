import { ConflictException } from '@nestjs/common';

export class UniqueNameException extends ConflictException {
  public constructor() {
    super('Systems created by the same user must have a unique name');
  }
};
