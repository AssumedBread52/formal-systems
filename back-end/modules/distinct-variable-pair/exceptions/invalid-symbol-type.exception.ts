import { UnprocessableEntityException } from '@nestjs/common';

export class InvalidSymbolTypeException extends UnprocessableEntityException {
  public constructor() {
    super('Distinct variable pairs must only contain variable symbols');
  }
};
