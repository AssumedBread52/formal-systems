import { ConflictException } from '@nestjs/common';

export class UserUniqueEmailAddressException extends ConflictException {
  constructor() {
    super('Users must have a unique e-mail address.');
  }
};
