import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, MaxLength } from 'class-validator';

@InputType()
export class NewSymbolPayload {
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  @MaxLength(200)
  public readonly name: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  @MaxLength(5000)
  public readonly description: string = '';
  @Field((): typeof SymbolType => {
    return SymbolType;
  })
  @IsEnum(SymbolType)
  public readonly type: SymbolType = SymbolType.constant;
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  @MaxLength(250)
  public readonly content: string = '';
};
