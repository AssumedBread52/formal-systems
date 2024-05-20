import { UnprocessableEntityException } from '@nestjs/common';

export class InvalidSymbolPrefixException extends UnprocessableEntityException {
  constructor() {
    super('All logical hypotheses and the assertion must start with a constant symbol.');
  }
};
