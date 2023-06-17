import { SystemEntity } from '@/system/system.entity';
import { UserPayload } from '@/user/data-transfer-objects/user.payload';
import { Optional } from '@nestjs/common';
import { Type } from 'class-transformer';
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
  @Optional()
  @Type(() => UserPayload)
  createdByUser?: UserPayload;

  constructor(system: SystemEntity) {
    const { _id, title, description, createdByUserId, createdByUser } = system;

    this.id = _id;
    this.title = title;
    this.description = description;
    this.createdByUserId = createdByUserId;
    if (createdByUser) {
      this.createdByUser = new UserPayload(createdByUser);
    }
  }
};
