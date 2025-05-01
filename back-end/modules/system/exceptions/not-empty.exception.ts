import { UnprocessableEntityException } from '@nestjs/common';

export class NotEmptyException extends UnprocessableEntityException {
  constructor() {
    super('System must be empty.');
  }
};
