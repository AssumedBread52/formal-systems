import { UnprocessableEntityException } from '@nestjs/common';

export class InUseException extends UnprocessableEntityException {
  constructor() {
    super('Systems in use cannot under go write actions.');
  }
};
