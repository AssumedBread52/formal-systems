import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { IsEnum, IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';

export class SymbolPayload {
  @IsMongoId()
  id: string;
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
  systemId: string;
  @IsMongoId()
  createdByUserId: string;

  constructor(symbol: SymbolEntity) {
    const { _id, title, description, type, content, axiomAppearances, theoremAppearances, deductionAppearances, systemId, createdByUserId } = symbol;

    this.id = _id.toString();
    this.title = title;
    this.description = description;
    this.type = type;
    this.content = content;
    this.axiomAppearances = axiomAppearances;
    this.theoremAppearances = theoremAppearances;
    this.deductionAppearances = deductionAppearances;
    this.systemId = systemId.toString();
    this.createdByUserId = createdByUserId.toString();
  }
};
