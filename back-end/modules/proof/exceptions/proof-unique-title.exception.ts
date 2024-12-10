import { ConflictException } from '@nestjs/common';

export class ProofUniqueTitleException extends ConflictException {
  constructor() {
    super('Proofs for the same statement in the same system must have a unique title.');
  }
};
