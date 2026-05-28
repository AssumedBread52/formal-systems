import { UnprocessableEntityException } from '@nestjs/common';

export class InvalidExpressionTypeException extends UnprocessableEntityException {
  public constructor() {
    super('Expression type is invalid');
  }
};
