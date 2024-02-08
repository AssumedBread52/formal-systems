import { StatementEntity } from '@/statement/statement.entity';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongodb';

export class StatementPayload {
  @IsMongoId()
  @Transform((params: TransformFnParams): any => {
    const { value } = params;

    return value.toString();
  })
  id: ObjectId;
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  description: string;
  @IsMongoId()
  @Transform((params: TransformFnParams): any => {
    const { value } = params;

    return value.toString();
  })
  systemId: ObjectId;
  @IsMongoId()
  @Transform((params: TransformFnParams): any => {
    const { value } = params;

    return value.toString();
  })
  createdByUserId: ObjectId;

  constructor(statement: StatementEntity) {
    const { _id, title, description, systemId, createdByUserId } = statement;

    this.id = _id;
    this.title = title;
    this.description = description;
    this.systemId = systemId;
    this.createdByUserId = createdByUserId;
  }
};
