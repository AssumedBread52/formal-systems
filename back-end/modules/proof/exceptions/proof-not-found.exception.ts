import { NotFoundException } from '@nestjs/common';

export class ProofNotFoundException extends NotFoundException {
  constructor() {
    super('Proof not found.');
  }
};
