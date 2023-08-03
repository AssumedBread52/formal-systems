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
  axiomaticStatementAppearances: number;
  @IsInt()
  @Min(0)
  nonAxiomaticStatementAppearances: number;
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
    const { _id, title, description, type, content, axiomaticStatementAppearances, nonAxiomaticStatementAppearances, systemId, createdByUserId } = symbol;

    this.id = _id;
    this.title = title;
    this.description = description;
    this.type = type;
    this.content = content;
    this.axiomaticStatementAppearances = axiomaticStatementAppearances;
    this.nonAxiomaticStatementAppearances = nonAxiomaticStatementAppearances;
    this.systemId = systemId;
    this.createdByUserId = createdByUserId;
  }
};
