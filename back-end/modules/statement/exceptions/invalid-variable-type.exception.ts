import { UnprocessableEntityException } from '@nestjs/common';

export class InvalidVariableTypeException extends UnprocessableEntityException {
  constructor() {
    super('Invalid variable type.');
  }
};
