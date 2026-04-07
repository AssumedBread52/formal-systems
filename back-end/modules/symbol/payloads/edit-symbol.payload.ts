import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, MaxLength } from 'class-validator';

@InputType()
export class EditSymbolPayload {
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  @MaxLength(200)
  public readonly newName: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  @MaxLength(5000)
  public readonly newDescription: string = '';
  @Field((): typeof SymbolType => {
    return SymbolType;
  })
  @IsEnum(SymbolType)
  public readonly newType: SymbolType = SymbolType.constant;
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  @MaxLength(250)
  public readonly newContent: string = '';
};
