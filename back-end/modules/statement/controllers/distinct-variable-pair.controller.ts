import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { NewDistinctVariablePairPayload } from '@/statement/payloads/new-distinct-variable-pair.payload';
import { PaginatedDistinctVariablePairsPayload } from '@/statement/payloads/paginated-distinct-variable-pairs.payload';
import { SearchDistinctVariablePairsPayload } from '@/statement/payloads/search-distinct-variable-pairs.payload';
import { DistinctVariablePairReadService } from '@/statement/services/distinct-variable-pair-read.service';
import { DistinctVariablePairWriteService } from '@/statement/services/distinct-variable-pair-write.service';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';

@Controller('system/:systemId/statement/:statementId/distinct-variable-pair')
export class DistinctVariablePairController {
  public constructor(private readonly distinctVariablePairReadService: DistinctVariablePairReadService, private readonly distinctVariablePairWriteService: DistinctVariablePairWriteService) {
  }

  @Delete(':variableSymbol1Id/:variableSymbol2Id')
  @UseGuards(JwtGuard)
  public deleteDistinctVariablePair(@SessionUser('id') sessionUserId: string, @Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string, @Param('variableSymbol1Id', new ParseUUIDPipe()) variableSymbol1Id: string, @Param('variableSymbol2Id', new ParseUUIDPipe()) variableSymbol2Id: string): Promise<DistinctVariablePairEntity> {
    return this.distinctVariablePairWriteService.delete(sessionUserId, systemId, statementId, variableSymbol1Id, variableSymbol2Id);
  }

  @Get()
  public getDistinctVariablePairs(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string, @Query(new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true })) searchDistinctVariablePairsPayload: SearchDistinctVariablePairsPayload): Promise<PaginatedDistinctVariablePairsPayload> {
    return this.distinctVariablePairReadService.searchDistinctVariablePairs(systemId, statementId, searchDistinctVariablePairsPayload);
  }

  @Get(':variableSymbol1Id/:variableSymbol2Id')
  public getById(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string, @Param('variableSymbol1Id', new ParseUUIDPipe()) variableSymbol1Id: string, @Param('variableSymbol2Id', new ParseUUIDPipe()) variableSymbol2Id: string): Promise<DistinctVariablePairEntity> {
    return this.distinctVariablePairReadService.selectById(systemId, statementId, variableSymbol1Id, variableSymbol2Id);
  }

  @Post()
  @UseGuards(JwtGuard)
  public postDistinctVariablePair(@SessionUser('id') sessionUserId: string, @Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string, @Body(new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true })) newDistinctVariablePairPayload: NewDistinctVariablePairPayload): Promise<DistinctVariablePairEntity> {
    return this.distinctVariablePairWriteService.create(sessionUserId, systemId, statementId, newDistinctVariablePairPayload);
  }
};
