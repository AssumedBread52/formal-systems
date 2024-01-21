import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEnum, IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';
import { ObjectId } from 'mongodb';

export class SymbolPayload {
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
  @IsEnum(SymbolType)
  type: SymbolType;
  @IsNotEmpty()
  content: string;
  @IsInt()
  @Min(0)
  axiomAppearances: number;
  @IsInt()
  @Min(0)
  theoremAppearances: number;
  @IsInt()
  @Min(0)
  deductionAppearances: number;
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

  constructor(symbol: SymbolEntity) {
    const { _id, title, description, type, content, axiomAppearances, theoremAppearances, deductionAppearances, systemId, createdByUserId } = symbol;

    this.id = _id;
    this.title = title;
    this.description = description;
    this.type = type;
    this.content = content;
    this.axiomAppearances = axiomAppearances;
    this.theoremAppearances = theoremAppearances;
    this.deductionAppearances = deductionAppearances;
    this.systemId = systemId;
    this.createdByUserId = createdByUserId;
  }
};
