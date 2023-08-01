import { SystemEntity } from '@/system/system.entity';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';
import { ObjectId } from 'mongodb';

export class SystemPayload {
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
  @IsInt()
  @Min(0)
  constantSymbolCount: number;
  @IsInt()
  @Min(0)
  variableSymbolCount: number;
  @IsMongoId()
  @Transform((params: TransformFnParams): any => {
    const { value } = params;

    return value.toString();
  })
  createdByUserId: ObjectId;

  constructor(system: SystemEntity) {
    const { _id, title, description, constantSymbolCount, variableSymbolCount, createdByUserId } = system;

    this.id = _id;
    this.title = title;
    this.description = description;
    this.constantSymbolCount = constantSymbolCount;
    this.variableSymbolCount = variableSymbolCount;
    this.createdByUserId = createdByUserId;
  }
};
