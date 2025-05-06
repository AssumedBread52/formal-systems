import { IsMongoId, IsNotEmpty } from 'class-validator';

export class MongoConflictPayload {
  @IsNotEmpty()
  title: string = '';
  @IsMongoId()
  createdByUserId: string = '';
};
