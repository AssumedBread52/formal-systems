import { ForbiddenException } from '@nestjs/common';

export class OwnershipException extends ForbiddenException {
  public constructor() {
    super('User does not own the resource');
  }
};
