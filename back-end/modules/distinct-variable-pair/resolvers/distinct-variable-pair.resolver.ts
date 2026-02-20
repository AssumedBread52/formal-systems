import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { DistinctVariablePairEntity } from '@/distinct-variable-pair/entities/distinct-variable-pair.entity';
import { NewDistinctVariablePairPayload } from '@/distinct-variable-pair/payloads/new-distinct-variable-pair.payload';
import { PaginatedDistinctVariablePairsPayload } from '@/distinct-variable-pair/payloads/paginated-distinct-variable-pairs.payload';
import { SearchDistinctVariablePairsPayload } from '@/distinct-variable-pair/payloads/search-distinct-variable-pairs.payload';
import { DistinctVariablePairReadService } from '@/distinct-variable-pair/services/distinct-variable-pair-read.service';
import { DistinctVariablePairWriteService } from '@/distinct-variable-pair/services/distinct-variable-pair-write.service';
import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class DistinctVariablePairResolver {
  public constructor(private readonly distinctVariablePairReadService: DistinctVariablePairReadService, private readonly distinctVariablePairWriteService: DistinctVariablePairWriteService) {
  }

  @Mutation((): typeof DistinctVariablePairEntity => {
    return DistinctVariablePairEntity;
  })
  @UseGuards(JwtGuard)
  public createDistinctVariablePair(@SessionUser('id') sessionUserId: string, @Args('systemId') systemId: string, @Args('distinctVariablePairPayload', new ValidationPipe({ transform: true })) newDistinctVariablePairPayload: NewDistinctVariablePairPayload): Promise<DistinctVariablePairEntity> {
    return this.distinctVariablePairWriteService.create(sessionUserId, systemId, newDistinctVariablePairPayload);
  }

  @Mutation((): typeof DistinctVariablePairEntity => {
    return DistinctVariablePairEntity;
  })
  @UseGuards(JwtGuard)
  public deleteDistinctVariablePair(@SessionUser('id') sessionUserId: string, @Args('systemId') systemId: string, @Args('distinctVariablePairId') distinctVariablePairId: string): Promise<DistinctVariablePairEntity> {
    return this.distinctVariablePairWriteService.delete(sessionUserId, systemId, distinctVariablePairId);
  }

  @Query((): typeof DistinctVariablePairEntity => {
    return DistinctVariablePairEntity;
  })
  public distinctVariablePair(@Args('systemId') systemId: string, @Args('distinctVariablePairId') distinctVariablePairId: string): Promise<DistinctVariablePairEntity> {
    return this.distinctVariablePairReadService.selectById(systemId, distinctVariablePairId);
  }

  @Query((): typeof PaginatedDistinctVariablePairsPayload => {
    return PaginatedDistinctVariablePairsPayload;
  })
  public distinctVariablePairs(@Args('systemId') systemId: string, @Args('filters', new ValidationPipe({ transform: true })) searchDistinctVariablePairsPayload: SearchDistinctVariablePairsPayload): Promise<PaginatedDistinctVariablePairsPayload> {
    return this.distinctVariablePairReadService.searchDistinctVariablePairs(systemId, searchDistinctVariablePairsPayload);
  }
};
