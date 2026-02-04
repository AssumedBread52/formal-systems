import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class EditSymbolPayload {
  @IsNotEmpty()
  newTitle: string = '';
  @IsNotEmpty()
  newDescription: string = '';
  @IsEnum(SymbolType)
  newType: SymbolType = SymbolType.constant;
  @IsNotEmpty()
  newContent: string = '';
};
