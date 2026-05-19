import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsUUID } from 'class-validator';

@InputType()
export class NewHypothesisPayload {
  @Field((): typeof String => {
    return String;
  })
  @IsUUID()
  public readonly expressionId: string = '';
  @Field((): typeof HypothesisType => {
    return HypothesisType;
  })
  @IsEnum(HypothesisType)
  public readonly type: HypothesisType = HypothesisType.logic;
};
