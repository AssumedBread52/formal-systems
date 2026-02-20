import { UnprocessableEntityException } from '@nestjs/common';

export class MaxPairsExistException extends UnprocessableEntityException {
  public constructor() {
    super('The system already has all possible distinct variable pairs defined');
  }
};
