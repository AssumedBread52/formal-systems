import { ConflictException } from '@nestjs/common';

export class UniquePairException extends ConflictException {
  public constructor() {
    super('Distinct variable pairs in the same system must have a unique pair of variable symbols');
  }
};
