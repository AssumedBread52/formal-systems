import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { PaginatedHypothesesPayload } from '@/statement/payloads/paginated-hypotheses.payload';
import { SearchHypothesesPayload } from '@/statement/payloads/search-hypotheses.payload';
import { HypothesisReadService } from '@/statement/services/hypothesis-read.service';
import { HypothesisWriteService } from '@/statement/services/hypothesis-write.service';
import { ParseUUIDPipe, UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class HypothesisResolver {
  public constructor(private readonly hypothesisReadService: HypothesisReadService, private readonly hypothesisWriteService: HypothesisWriteService) {
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
  public hypotheses(@Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('statementId', new ParseUUIDPipe()) statementId: string, @Args('filters', new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true })) searchHypothesesPayload: SearchHypothesesPayload): Promise<PaginatedHypothesesPayload> {
    return this.hypothesisReadService.searchHypotheses(systemId, statementId, searchHypothesesPayload);
  }
};
