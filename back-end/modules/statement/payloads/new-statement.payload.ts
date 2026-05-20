import { Field, InputType } from '@nestjs/graphql';
import { ArrayUnique, IsArray, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class NewStatementPayload {
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  @MaxLength(200)
  public readonly name: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsNotEmpty()
  @MaxLength(5000)
  public readonly description: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsUUID()
  public readonly assertionExpressionId: string = '';
  @ArrayUnique()
  @Field((): [typeof String] => {
    return [String];
  })
  @IsArray()
  @IsUUID('all', {
    each: true
  })
  public readonly typeHypothesesExpressionIds: string[] = [];
};
