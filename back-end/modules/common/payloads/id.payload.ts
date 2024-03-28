import { IsMongoId } from 'class-validator';
import { ObjectId } from 'mongodb';

export class IdPayload {
  @IsMongoId()
  id: string;

  constructor(id: ObjectId) {
    this.id = id.toString();
  }
};
