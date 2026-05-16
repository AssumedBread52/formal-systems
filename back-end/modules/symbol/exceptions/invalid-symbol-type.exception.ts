import { UnprocessableEntityException } from '@nestjs/common';

export class InvalidSymbolTypeException extends UnprocessableEntityException {
  public constructor() {
    super('Symbol has an invalid type');
  }
};
