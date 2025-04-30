import { AdapterType } from '@/system/enums/adapter-type.enum';
import { Exclude } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';

export class SystemEntity {
  @Exclude()
  @IsEnum(AdapterType)
  type: AdapterType = AdapterType.Mongo;
  @IsNotEmpty()
  id: string = '';
  @IsNotEmpty()
  title: string = '';
  @IsNotEmpty()
  description: string = '';
  @IsInt()
  @Min(0)
  constantSymbolCount: number = 0;
  @IsInt()
  @Min(0)
  variableSymbolCount: number = 0;
  @IsInt()
  @Min(0)
  axiomCount: number = 0;
  @IsInt()
  @Min(0)
  theoremCount: number = 0;
  @IsInt()
  @Min(0)
  deductionCount: number = 0;
  @IsInt()
  @Min(0)
  proofCount: number = 0;
  @IsNotEmpty()
  createdByUserId: string = '';
};
