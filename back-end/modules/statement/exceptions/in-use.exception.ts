import { UnprocessableEntityException } from '@nestjs/common';

export class InUseException extends UnprocessableEntityException {
  constructor() {
    super('Statements in use cannot under go write actions.');
  }
};
