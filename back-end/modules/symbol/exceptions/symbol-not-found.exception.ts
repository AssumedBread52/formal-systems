import { NotFoundException } from '@nestjs/common';

export class SymbolNotFoundException extends NotFoundException {
  constructor() {
    super('Symbol not found.');
  }
};
