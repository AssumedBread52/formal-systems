import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsMongoId } from 'class-validator';

@InputType()
export class NewExpressionPayload {
  @Field((): [typeof String] => {
    return [String];
  })
  @IsArray()
  @IsMongoId({
    each: true
  })
  public readonly symbolIds: string[] = [];
};
