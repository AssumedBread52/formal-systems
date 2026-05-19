import { ConflictException } from '@nestjs/common';

export class UniqueVariableSymbolTypeException extends ConflictException {
  public constructor() {
    super('Variable symbols in a statement can only be typed once');
  }
};
