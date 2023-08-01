import { Transform, TransformFnParams } from 'class-transformer';
import { IsMongoId } from 'class-validator';
import { ObjectId } from 'mongodb';

export class IdPayload {
  @IsMongoId()
  @Transform((params: TransformFnParams): any => {
    const { value } = params;

    return value.toString();
  })
  id: ObjectId;

  constructor(_id: ObjectId) {
    this.id = _id;
  }
};
