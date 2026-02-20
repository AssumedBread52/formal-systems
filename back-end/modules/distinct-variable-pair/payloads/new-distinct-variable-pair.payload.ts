import { Field, InputType } from '@nestjs/graphql';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsMongoId } from 'class-validator';

@InputType()
export class NewDistinctVariablePairPayload {
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
  public readonly variableSymbolIds: [string, string] = ['', ''];
};
