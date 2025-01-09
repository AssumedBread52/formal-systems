import { UnprocessableEntityException } from '@nestjs/common';

export class ProofIncompleteException extends UnprocessableEntityException {
  constructor() {
    super('The proof is incomplete.');
  }
};
