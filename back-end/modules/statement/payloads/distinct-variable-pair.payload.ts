import { Field, ObjectType } from '@nestjs/graphql';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsMongoId } from 'class-validator';

@ObjectType()
export class DistinctVariablePairPayload {
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
};
