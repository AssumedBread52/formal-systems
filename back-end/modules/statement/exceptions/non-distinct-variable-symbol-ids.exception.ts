import { UnprocessableEntityException } from '@nestjs/common';

export class NonDistinctVariableSymbolIdsException extends UnprocessableEntityException {
  public constructor() {
    super('Variable symbol IDs must be distinct');
  }
};
