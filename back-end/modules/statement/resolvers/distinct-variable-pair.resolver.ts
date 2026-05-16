import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { NewDistinctVariablePairPayload } from '@/statement/payloads/new-distinct-variable-pair.payload';
import { PaginatedDistinctVariablePairsPayload } from '@/statement/payloads/paginated-distinct-variable-pairs.payload';
import { SearchDistinctVariablePairsPayload } from '@/statement/payloads/search-distinct-variable-pairs.payload';
import { DistinctVariablePairReadService } from '@/statement/services/distinct-variable-pair-read.service';
import { DistinctVariablePairWriteService } from '@/statement/services/distinct-variable-pair-write.service';
import { ParseUUIDPipe, UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class DistinctVariablePairResolver {
  public constructor(private readonly distinctVariablePairReadService: DistinctVariablePairReadService, private readonly distinctVariablePairWriteService: DistinctVariablePairWriteService) {
  }

  @Mutation((): typeof DistinctVariablePairEntity => {
    return DistinctVariablePairEntity;
  })
  @UseGuards(JwtGuard)
  public createDistinctVariablePair(@SessionUser('id') sessionUserId: string, @Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('statementId', new ParseUUIDPipe()) statementId: string, @Args('distinctVariablePairPayload', new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true })) newDistinctVariablePairPayload: NewDistinctVariablePairPayload): Promise<DistinctVariablePairEntity> {
    return this.distinctVariablePairWriteService.create(sessionUserId, systemId, statementId, newDistinctVariablePairPayload);
  }

  @Mutation((): typeof DistinctVariablePairEntity => {
    return DistinctVariablePairEntity;
  })
  @UseGuards(JwtGuard)
  public deleteDistinctVariablePair(@SessionUser('id') sessionUserId: string, @Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('statementId', new ParseUUIDPipe()) statementId: string, @Args('variableSymbol1Id', new ParseUUIDPipe()) variableSymbol1Id: string, @Args('variableSymbol2Id', new ParseUUIDPipe()) variableSymbol2Id: string): Promise<DistinctVariablePairEntity> {
    return this.distinctVariablePairWriteService.delete(sessionUserId, systemId, statementId, variableSymbol1Id, variableSymbol2Id);
  }

  @Query((): typeof DistinctVariablePairEntity => {
    return DistinctVariablePairEntity;
  })
  public distinctVariablePair(@Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('statementId', new ParseUUIDPipe()) statementId: string, @Args('variableSymbol1Id', new ParseUUIDPipe()) variableSymbol1Id: string, @Args('variableSymbol2Id', new ParseUUIDPipe()) variableSymbol2Id: string): Promise<DistinctVariablePairEntity> {
    return this.distinctVariablePairReadService.selectById(systemId, statementId, variableSymbol1Id, variableSymbol2Id);
  }

  @Query((): typeof PaginatedDistinctVariablePairsPayload => {
    return PaginatedDistinctVariablePairsPayload;
  })
  public distinctVariablePairs(@Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('statementId', new ParseUUIDPipe()) statementId: string, @Args('filters', new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true })) searchDistinctVariablePairsPayload: SearchDistinctVariablePairsPayload): Promise<PaginatedDistinctVariablePairsPayload> {
    return this.distinctVariablePairReadService.searchDistinctVariablePairs(systemId, statementId, searchDistinctVariablePairsPayload);
  }
};
