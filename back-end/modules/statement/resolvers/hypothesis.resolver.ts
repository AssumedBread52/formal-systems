import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { NewHypothesisPayload } from '@/statement/payloads/new-hypothesis.payload';
import { PaginatedHypothesesPayload } from '@/statement/payloads/paginated-hypotheses.payload';
import { SearchHypothesesPayload } from '@/statement/payloads/search-hypotheses.payload';
import { HypothesisReadService } from '@/statement/services/hypothesis-read.service';
import { HypothesisWriteService } from '@/statement/services/hypothesis-write.service';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class HypothesisResolver {
  public constructor(private readonly hypothesisReadService: HypothesisReadService, private readonly hypothesisWriteService: HypothesisWriteService) {
  }

  @Mutation((): typeof HypothesisEntity => {
    return HypothesisEntity;
  })
  @UseGuards(JwtGuard)
  public createHypothesis(@SessionUser('id') sessionUserId: string, @Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('statementId', new ParseUUIDPipe()) statementId: string, @Args('hypothesisPayload') newHypothesisPayload: NewHypothesisPayload): Promise<HypothesisEntity> {
    return this.hypothesisWriteService.create(sessionUserId, systemId, statementId, newHypothesisPayload);
  }

  @Mutation((): typeof HypothesisEntity => {
    return HypothesisEntity;
  })
  @UseGuards(JwtGuard)
  public deleteHypothesis(@SessionUser('id') sessionUserId: string, @Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('statementId', new ParseUUIDPipe()) statementId: string, @Args('hypothesisId', new ParseUUIDPipe()) hypothesisId: string): Promise<HypothesisEntity> {
    return this.hypothesisWriteService.delete(sessionUserId, systemId, statementId, hypothesisId);
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
  public hypotheses(@Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('statementId', new ParseUUIDPipe()) statementId: string, @Args('filters') searchHypothesesPayload: SearchHypothesesPayload): Promise<PaginatedHypothesesPayload> {
    return this.hypothesisReadService.searchHypotheses(systemId, statementId, searchHypothesesPayload);
  }
};
