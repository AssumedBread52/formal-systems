import { UnprocessableEntityException } from '@nestjs/common';

export class VariableSymbolNotTypedException extends UnprocessableEntityException {
  public constructor() {
    super('At least one variable symbol does not have a corresponding type hypothesis');
  }
};
