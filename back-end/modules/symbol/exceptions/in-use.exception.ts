import { UnprocessableEntityException } from '@nestjs/common';

export class InUseException extends UnprocessableEntityException {
  public constructor() {
    super('Symbols in use cannot under go write actions');
  }
};
