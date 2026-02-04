import { NotFoundException } from '@nestjs/common';

export class SymbolNotFoundException extends NotFoundException {
  public constructor() {
    super('Symbol not found');
  }
};
