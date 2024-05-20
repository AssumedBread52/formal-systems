import { NotFoundException } from '@nestjs/common';

export class StatementNotFoundException extends NotFoundException {
  constructor() {
    super('Statement not found.');
  }
};
