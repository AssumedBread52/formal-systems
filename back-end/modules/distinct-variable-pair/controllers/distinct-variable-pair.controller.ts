import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { DistinctVariablePairEntity } from '@/distinct-variable-pair/entities/distinct-variable-pair.entity';
import { NewDistinctVariablePairPayload } from '@/distinct-variable-pair/payloads/new-distinct-variable-pair.payload';
import { PaginatedDistinctVariablePairsPayload } from '@/distinct-variable-pair/payloads/paginated-distinct-variable-pairs.payload';
import { SearchDistinctVariablePairsPayload } from '@/distinct-variable-pair/payloads/search-distinct-variable-pairs.payload';
import { DistinctVariablePairReadService } from '@/distinct-variable-pair/services/distinct-variable-pair-read.service';
import { DistinctVariablePairWriteService } from '@/distinct-variable-pair/services/distinct-variable-pair-write.service';
import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Post, Query, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';

@Controller('system/:systemId/distinct-variable-pair')
export class DistinctVariablePairController {
  public constructor(private readonly distinctVariablePairReadService: DistinctVariablePairReadService, private readonly distinctVariablePairWriteService: DistinctVariablePairWriteService) {
  }

  @Delete(':distinctVariablePairId')
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public deleteDistinctVariablePair(@SessionUser('id') sessionUserId: string, @Param('systemId') systemId: string, @Param('distinctVariablePairId') distinctVariablePairId: string): Promise<DistinctVariablePairEntity> {
    return this.distinctVariablePairWriteService.delete(sessionUserId, systemId, distinctVariablePairId);
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  public getDistinctVariablePairs(@Param('systemId') systemId: string, @Query(new ValidationPipe({ transform: true })) searchDistinctVariablePairsPayload: SearchDistinctVariablePairsPayload): Promise<PaginatedDistinctVariablePairsPayload> {
    return this.distinctVariablePairReadService.searchDistinctVariablePairs(systemId, searchDistinctVariablePairsPayload);
  }

  @Get(':distinctVariablePairId')
  @UseInterceptors(ClassSerializerInterceptor)
  public getById(@Param('systemId') systemId: string, @Param('distinctVariablePairId') distinctVariablePairId: string): Promise<DistinctVariablePairEntity> {
    return this.distinctVariablePairReadService.selectById(systemId, distinctVariablePairId);
  }

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public postDistinctVariablePair(@SessionUser('id') sessionUserId: string, @Param('systemId') systemId: string, @Body(new ValidationPipe({ transform: true })) newDistinctVariablePairPayload: NewDistinctVariablePairPayload): Promise<DistinctVariablePairEntity> {
    return this.distinctVariablePairWriteService.create(sessionUserId, systemId, newDistinctVariablePairPayload);
  }
};
