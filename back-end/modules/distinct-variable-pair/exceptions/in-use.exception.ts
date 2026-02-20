import { UnprocessableEntityException } from '@nestjs/common';

export class InUseException extends UnprocessableEntityException {
  public constructor() {
    super('Distinct variable pairs in use cannot under go write actions');
  }
};
