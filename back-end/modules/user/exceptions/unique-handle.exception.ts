import { ConflictException } from '@nestjs/common';

export class UniqueHandleException extends ConflictException {
  public constructor() {
    super('Users must have a unique handle');
  }
};
