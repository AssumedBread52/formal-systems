import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { HypothesisReadService } from '@/statement/services/hypothesis-read.service';
import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class HypothesisResolver {
  public constructor(private readonly hypothesisReadService: HypothesisReadService) {
  }

  @Query((): typeof HypothesisEntity => {
    return HypothesisEntity;
  })
  public hypothesis(@Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('statementId', new ParseUUIDPipe()) statementId: string, @Args('hypothesisId', new ParseUUIDPipe()) hypothesisId: string): Promise<HypothesisEntity> {
    return this.hypothesisReadService.selectById(systemId, statementId, hypothesisId);
  }
};
