import { ExpressionType } from '@/expression/enums/expression-type.enum';
import { Field, ObjectType } from '@nestjs/graphql';
import { IsArray, IsEnum, IsMongoId } from 'class-validator';

@ObjectType()
export class ExpressionEntity {
  @Field((): typeof String => {
    return String;
  })
  @IsMongoId()
  public id: string = '';
  @Field((): [typeof String] => {
    return [String];
  })
  @IsArray()
  @IsMongoId({
    each: true
  })
  public symbolIds: string[] = [];
  @Field((): typeof ExpressionType => {
    return ExpressionType;
  })
  @IsEnum(ExpressionType)
  public type: ExpressionType = ExpressionType.standard;
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

  public isInUse(): boolean {
    return false;
  }
};
