import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';

@ObjectType()
export class SystemEntity {
  @Field((): typeof String => {
    return String;
  })
  @IsMongoId()
  public id: string = '';
  @Field()
  @IsNotEmpty()
  public title: string = '';
  @Field()
  @IsNotEmpty()
  public description: string = '';
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public constantSymbolCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public variableSymbolCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public axiomCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public theoremCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public deductionCount: number = 0;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public proofCount: number = 0;
  @Field((): typeof String => {
    return String;
  })
  @IsMongoId()
  public createdByUserId: string = '';
};
