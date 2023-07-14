import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class NewSymbolPayload {
  @IsNotEmpty()
  newTitle: string = '';
  @IsNotEmpty()
  newDescription: string = '';
  @IsEnum(SymbolType)
  newType: SymbolType = SymbolType.Constant;
  @IsNotEmpty()
  newContent: string = '';
};
