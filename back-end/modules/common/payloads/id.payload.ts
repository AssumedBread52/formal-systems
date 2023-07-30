import { IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongodb';

export class IdPayload {
  @IsNotEmpty()
  id: ObjectId;

  constructor(_id: ObjectId) {
    this.id = _id;
  }
};
