import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongodb';

export class SymbolPayload {
  @IsNotEmpty()
  id: ObjectId;
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  description: string;
  @IsEnum(SymbolType)
  type: SymbolType;
  @IsNotEmpty()
  content: string;
  @IsNotEmpty()
  systemId: ObjectId;
  @IsNotEmpty()
  createdByUserId: ObjectId;

  constructor(symbol: SymbolEntity) {
    const { _id, title, description, type, content, systemId, createdByUserId } = symbol;

    this.id = _id;
    this.title = title;
    this.description = description;
    this.type = type;
    this.content = content;
    this.systemId = systemId;
    this.createdByUserId = createdByUserId;
  }
};
