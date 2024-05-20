import { UnprocessableEntityException } from '@nestjs/common';

export class InUseException extends UnprocessableEntityException {
  constructor() {
    super('Symbols in use cannot under go write actions.');
  }
};
