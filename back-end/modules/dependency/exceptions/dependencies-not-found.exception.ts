import { NotFoundException } from '@nestjs/common';

export class DependenciesNotFoundException extends NotFoundException {
  public constructor() {
    super('Dependencies not found');
  }
};
