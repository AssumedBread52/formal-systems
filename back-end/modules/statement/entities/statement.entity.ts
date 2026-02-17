import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';

@ObjectType()
export class StatementEntity {
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
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(0)
  public proofCount: number = 0;
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
