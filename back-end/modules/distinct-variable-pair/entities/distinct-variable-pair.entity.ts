import { Field, ObjectType } from '@nestjs/graphql';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsMongoId } from 'class-validator';

@ObjectType()
export class DistinctVariablePairEntity {
  @Field((): typeof String => {
    return String;
  })
  @IsMongoId()
  public id: string = '';
  @ArrayMaxSize(2)
  @ArrayMinSize(2)
  @ArrayUnique()
  @Field((): [typeof String] => {
    return [String];
  })
  @IsArray()
  @IsMongoId({
    each: true
  })
  public variableSymbolIds: [string, string] = ['', ''];
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
