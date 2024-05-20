import { ConflictException } from '@nestjs/common';

export class SymbolUniqueTitleException extends ConflictException {
  constructor() {
    super('Symbols in the same system must have a unique title.');
  }
};
