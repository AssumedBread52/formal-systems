import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';

@InputType()
export class EditSymbolPayload {
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  newTitle: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  newDescription: string = '';
  @Field((): typeof SymbolType => {
    return SymbolType;
  })
  @IsEnum(SymbolType)
  newType: SymbolType = SymbolType.constant;
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  newContent: string = '';
};
