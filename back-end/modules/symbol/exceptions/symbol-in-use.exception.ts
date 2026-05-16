import { ConflictException } from '@nestjs/common';

export class SymbolInUseException extends ConflictException {
  public constructor() {
    super('Symbols in use cannot change their type');
  }
};
