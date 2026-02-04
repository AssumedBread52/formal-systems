import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class NewSymbolPayload {
  @IsNotEmpty()
  title: string = '';
  @IsNotEmpty()
  description: string = '';
  @IsEnum(SymbolType)
  type: SymbolType = SymbolType.constant;
  @IsNotEmpty()
  content: string = '';
};
