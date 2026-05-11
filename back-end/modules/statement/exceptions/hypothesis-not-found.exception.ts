import { NotFoundException } from '@nestjs/common';

export class HypothesisNotFoundException extends NotFoundException {
  public constructor() {
    super('Hypothesis not found');
  }
};
