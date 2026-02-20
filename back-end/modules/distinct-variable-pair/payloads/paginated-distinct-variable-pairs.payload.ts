import { DistinctVariablePairEntity } from '@/distinct-variable-pair/entities/distinct-variable-pair.entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginatedDistinctVariablePairsPayload {
  @Field((): [typeof DistinctVariablePairEntity] => {
    return [DistinctVariablePairEntity];
  })
  public readonly results: DistinctVariablePairEntity[];
  @Field((): typeof Int => {
    return Int;
  })
  public readonly total: number;

  public constructor(distinctVariablePairs: DistinctVariablePairEntity[], total: number) {
    this.results = distinctVariablePairs;
    this.total = total;
  }
};
