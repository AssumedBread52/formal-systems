import { ConflictException } from '@nestjs/common';

export class TypeHypothesisInUseException extends ConflictException {
  public constructor() {
    super('Type hypothesis in use');
  }
};
