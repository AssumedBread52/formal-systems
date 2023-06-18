import { SystemEntity } from '@/system/system.entity';
import { IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongodb';

export class SystemPayload {
  @IsNotEmpty()
  id: ObjectId;
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  createdByUserId: ObjectId;

  constructor(system: SystemEntity) {
    const { _id, title, description, createdByUserId } = system;

    this.id = _id;
    this.title = title;
    this.description = description;
    this.createdByUserId = createdByUserId;
  }
};
