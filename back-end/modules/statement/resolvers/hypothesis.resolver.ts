import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { PaginatedHypothesesPayload } from '@/statement/payloads/paginated-hypotheses.payload';
import { SearchHypothesesPayload } from '@/statement/payloads/search-hypotheses.payload';
import { HypothesisReadService } from '@/statement/services/hypothesis-read.service';
import { ParseUUIDPipe, ValidationPipe } from '@nestjs/common';
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

  @Query((): typeof PaginatedHypothesesPayload => {
    return PaginatedHypothesesPayload;
  })
  public hypotheses(@Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('statementId', new ParseUUIDPipe()) statementId: string, @Args('filters', new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true })) searchHypothesesPayload: SearchHypothesesPayload): Promise<PaginatedHypothesesPayload> {
    return this.hypothesisReadService.searchHypotheses(systemId, statementId, searchHypothesesPayload);
  }
};
