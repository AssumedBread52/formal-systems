import { SystemEntity } from '@/system/system.entity';
import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ObjectId } from 'mongodb';

export class SystemPayload {
  @IsNotEmpty()
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
  @IsNotEmpty()
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
