import { NotFoundException } from '@nestjs/common';

export class SystemNotFoundException extends NotFoundException {
  public constructor() {
    super('System not found');
  }
};
