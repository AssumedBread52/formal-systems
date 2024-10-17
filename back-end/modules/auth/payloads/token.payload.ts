import { IsMongoId } from 'class-validator';

export class TokenPayload {
  @IsMongoId()
  id: string = '';
};
