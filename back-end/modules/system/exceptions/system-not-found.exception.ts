import { NotFoundException } from '@nestjs/common';

export class SystemNotFoundException extends NotFoundException {
  constructor() {
    super('System not found.');
  }
};
