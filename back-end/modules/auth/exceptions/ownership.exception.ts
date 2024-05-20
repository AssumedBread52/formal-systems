import { ForbiddenException } from '@nestjs/common';

export class OwnershipException extends ForbiddenException {
  constructor() {
    super('Write actions require user ownership.');
  }
};
