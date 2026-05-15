import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { PaginatedDistinctVariablePairsPayload } from '@/statement/payloads/paginated-distinct-variable-pairs.payload';
import { SearchDistinctVariablePairsPayload } from '@/statement/payloads/search-distinct-variable-pairs.payload';
import { DistinctVariablePairReadService } from '@/statement/services/distinct-variable-pair-read.service';
import { ClassSerializerInterceptor, Controller, Get, Param, ParseUUIDPipe, Query, UseInterceptors, ValidationPipe } from '@nestjs/common';

@Controller('system/:systemId/statement/:statementId/distinct-variable-pair')
export class DistinctVariablePairController {
  public constructor(private readonly distinctVariablePairReadService: DistinctVariablePairReadService) {
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  public getDistinctVariablePairs(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string, @Query(new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true })) searchDistinctVariablePairsPayload: SearchDistinctVariablePairsPayload): Promise<PaginatedDistinctVariablePairsPayload> {
    return this.distinctVariablePairReadService.searchDistinctVariablePairs(systemId, statementId, searchDistinctVariablePairsPayload);
  }

  @Get(':variableSymbol1Id/:variableSymbol2Id')
  @UseInterceptors(ClassSerializerInterceptor)
  public getById(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string, @Param('variableSymbol1Id', new ParseUUIDPipe()) variableSymbol1Id: string, @Param('variableSymbol2Id', new ParseUUIDPipe()) variableSymbol2Id: string): Promise<DistinctVariablePairEntity> {
    return this.distinctVariablePairReadService.selectById(systemId, statementId, variableSymbol1Id, variableSymbol2Id);
  }
};
