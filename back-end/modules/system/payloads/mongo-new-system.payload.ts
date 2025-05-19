import { IsMongoId, IsNotEmpty } from 'class-validator';

export class MongoNewSystemPayload {
  @IsNotEmpty()
  title: string = '';
  @IsNotEmpty()
  description: string = '';
  @IsMongoId()
  createdByUserId: string = '';
};
