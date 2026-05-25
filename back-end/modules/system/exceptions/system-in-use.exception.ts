import { ConflictException } from '@nestjs/common';

export class SystemInUseException extends ConflictException {
  public constructor() {
    super('System is in use');
  }
};
