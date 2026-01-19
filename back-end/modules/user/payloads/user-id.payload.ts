import { IsMongoId } from 'class-validator';

export class UserIdPayload {
  @IsMongoId()
  public readonly userId: string = '';
};
