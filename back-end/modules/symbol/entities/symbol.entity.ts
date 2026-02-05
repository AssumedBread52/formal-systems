import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';

@ObjectType()
export class SymbolEntity {
  @Field((): typeof String => {
    return String;
  })
  @IsMongoId()
  public id: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  public title: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  public description: string = '';
  @Field((): typeof SymbolType => {
    return SymbolType;
  })
  @IsEnum(SymbolType)
  public type: SymbolType = SymbolType.constant;
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  public content: string = '';
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public axiomAppearanceCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public theoremAppearanceCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public deductionAppearanceCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public proofAppearanceCount: number = 0;
  @Field((): typeof String => {
    return String;
  })
  @IsMongoId()
  public systemId: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsMongoId()
  public createdByUserId: string = '';
};
