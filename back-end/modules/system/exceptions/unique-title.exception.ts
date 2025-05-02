import { ConflictException } from '@nestjs/common';

export class UniqueTitleException extends ConflictException {
  constructor() {
    super('Systems created by the same user must have a unique title.');
  }
};
