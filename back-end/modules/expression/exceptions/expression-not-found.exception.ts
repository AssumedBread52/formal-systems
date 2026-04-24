import { NotFoundException } from '@nestjs/common';

export class ExpressionNotFoundException extends NotFoundException {
  public constructor() {
    super('Expression not found');
  }
};
