import { UnprocessableEntityException } from '@nestjs/common';

export class SymbolTypeNotChangeableException extends UnprocessableEntityException {
  public constructor() {
    super('Symbols used in expressions in use cannot change their type');
  }
};
