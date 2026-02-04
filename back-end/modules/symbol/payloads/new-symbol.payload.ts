import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';

@InputType()
export class NewSymbolPayload {
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  title: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  description: string = '';
  @Field((): typeof SymbolType => {
    return SymbolType;
  })
  @IsEnum(SymbolType)
  type: SymbolType = SymbolType.constant;
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  content: string = '';
};
