import { ConflictException } from '@nestjs/common';

export class ExpressionInUseException extends ConflictException {
  public constructor() {
    super('Expression is in use');
  }
};
