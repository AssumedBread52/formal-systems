import { UnprocessableEntityException } from '@nestjs/common';

export class InvalidExpressionLengthException extends UnprocessableEntityException {
  public constructor() {
    super('Expression is an unacceptable length');
  }
};
