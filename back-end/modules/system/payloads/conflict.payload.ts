import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ConflictPayload {
  @IsNotEmpty()
  title: string = '';
  @IsMongoId()
  createdByUserId: string = '';
};
