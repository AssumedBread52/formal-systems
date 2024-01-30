import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { ObjectId } from 'mongodb';

export class NewGroupingPayload {
  @IsNotEmpty()
  title: string = '';
  @IsNotEmpty()
  description: string = '';
  @IsMongoId()
  @IsOptional()
  parentId?: ObjectId;
};
