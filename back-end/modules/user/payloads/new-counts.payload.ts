import { IsInt, IsOptional, Min } from 'class-validator';

export class NewCountsPayload {
  @IsInt()
  @IsOptional()
  @Min(0)
  systemCount?: number;
  @IsInt()
  @IsOptional()
  @Min(0)
  constantSymbolCount?: number;
  @IsInt()
  @IsOptional()
  @Min(0)
  variableSymbolCount?: number;
  @IsInt()
  @IsOptional()
  @Min(0)
  axiomCount?: number;
  @IsInt()
  @IsOptional()
  @Min(0)
  theoremCount?: number;
  @IsInt()
  @IsOptional()
  @Min(0)
  deductionCount?: number;
  @IsInt()
  @IsOptional()
  @Min(0)
  proofCount?: number;
};
