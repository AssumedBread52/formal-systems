import { NotFoundException } from '@nestjs/common';

export class DistinctVariablePairNotFoundException extends NotFoundException {
  public constructor() {
    super('Distinct variable pair not found');
  }
};
