import { UnprocessableEntityException } from '@nestjs/common';

export class InvalidSymbolTypeException extends UnprocessableEntityException {
  constructor() {
    super('Invalid symbol type.');
  }
};
