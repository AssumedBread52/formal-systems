import { SystemEntity } from '@/system/system.entity';
import { IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';

export class SystemPayload {
  @IsMongoId()
  id: string;
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
  @IsInt()
  @Min(0)
  axiomCount: number;
  @IsInt()
  @Min(0)
  theoremCount: number;
  @IsInt()
  @Min(0)
  deductionCount: number;
  @IsMongoId()
  createdByUserId: string;

  constructor(system: SystemEntity) {
    const { _id, title, description, constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount, createdByUserId } = system;

    this.id = _id.toString();
    this.title = title;
    this.description = description;
    this.constantSymbolCount = constantSymbolCount;
    this.variableSymbolCount = variableSymbolCount;
    this.axiomCount = axiomCount;
    this.theoremCount = theoremCount;
    this.deductionCount = deductionCount;
    this.createdByUserId = createdByUserId.toString();
  }
};
