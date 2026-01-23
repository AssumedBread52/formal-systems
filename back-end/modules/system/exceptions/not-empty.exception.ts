import { UnprocessableEntityException } from '@nestjs/common';

export class NotEmptyException extends UnprocessableEntityException {
  public constructor() {
    super('System is not empty');
  }
};
