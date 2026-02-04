import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';

@InputType()
export class EditSymbolPayload {
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  public readonly newTitle: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
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
  public readonly newContent: string = '';
};
