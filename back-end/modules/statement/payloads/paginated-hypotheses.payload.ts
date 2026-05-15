import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginatedHypothesesPayload {
  @Field((): [typeof HypothesisEntity] => {
    return [HypothesisEntity];
  })
  public readonly results: HypothesisEntity[];
  @Field((): typeof Int => {
    return Int;
  })
  public readonly total: number;

  public constructor(hypotheses: HypothesisEntity[], total: number) {
    this.results = hypotheses;
    this.total = total;
  }
};
