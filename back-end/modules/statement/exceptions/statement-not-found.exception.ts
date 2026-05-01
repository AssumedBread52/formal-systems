import { NotFoundException } from '@nestjs/common';

export class StatementNotFoundException extends NotFoundException {
  public constructor() {
    super('Statement not found');
  }
};
