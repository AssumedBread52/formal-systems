import { ConflictException } from '@nestjs/common';

export class SymbolInUseException extends ConflictException {
  public constructor() {
    super('Symbols referenced by expressions cannot change their type');
  }
};
