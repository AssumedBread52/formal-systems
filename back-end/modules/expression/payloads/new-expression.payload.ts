import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsUUID } from 'class-validator';

@InputType()
export class NewExpressionPayload {
  @Field((): [typeof String] => {
    return [String];
  })
  @IsArray()
  @IsUUID('all', {
    each: true
  })
  public readonly canonical: string[] = [];
};
