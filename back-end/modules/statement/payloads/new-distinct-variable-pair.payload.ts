import { Field, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class NewDistinctVariablePairPayload {
  @Field((): typeof String => {
    return String;
  })
  @IsUUID()
  public readonly variableSymbol1Id: string = '';
  @Field((): typeof String => {
    return String;
  })
  @IsUUID()
  public readonly variableSymbol2Id: string = '';
};
