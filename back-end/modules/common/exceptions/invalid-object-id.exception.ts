import { UnprocessableEntityException } from '@nestjs/common';

export class InvalidObjectIdException extends UnprocessableEntityException {
  constructor() {
    super('Invalid Mongodb ID structure.');
  }
};
