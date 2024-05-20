import { ConflictException } from '@nestjs/common';

export class SystemUniqueTitleException extends ConflictException {
  constructor() {
    super('Systems created by the same user must have a unique title.');
  }
};
