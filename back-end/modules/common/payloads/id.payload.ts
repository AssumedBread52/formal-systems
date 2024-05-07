import { ObjectId } from 'mongodb';

export class IdPayload {
  id: string;

  constructor(id: ObjectId) {
    this.id = id.toString();
  }
};
