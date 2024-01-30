import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { ObjectId } from 'mongodb';

export class EditGroupingPayload {
  @IsNotEmpty()
  newTitle: string = '';
  @IsNotEmpty()
  newDescription: string = '';
  @IsMongoId()
  @IsOptional()
  newParentId?: ObjectId;
};
