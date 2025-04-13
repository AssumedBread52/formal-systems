import { ConflictException } from '@nestjs/common';

export class UniqueEmailAddressException extends ConflictException {
  constructor() {
    super('Users must have a unique e-mail address.');
  }
};
