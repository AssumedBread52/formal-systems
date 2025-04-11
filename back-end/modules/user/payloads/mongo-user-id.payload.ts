import { IsMongoId } from 'class-validator';

export class MongoUserIdPayload {
  @IsMongoId()
  userId: string = '';
};
