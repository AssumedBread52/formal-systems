import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { DistinctVariablePairReadService } from '@/statement/services/distinct-variable-pair-read.service';
import { ClassSerializerInterceptor, Controller, Get, Param, ParseUUIDPipe, UseInterceptors } from '@nestjs/common';

@Controller('system/:systemId/statement/:statementId/distinct-variable-pair')
export class DistinctVariablePairController {
  public constructor(private readonly distinctVariablePairReadService: DistinctVariablePairReadService) {
  }

  @Get(':variableSymbol1Id/:variableSymbol2Id')
  @UseInterceptors(ClassSerializerInterceptor)
  public getById(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string, @Param('variableSymbol1Id', new ParseUUIDPipe()) variableSymbol1Id: string, @Param('variableSymbol2Id', new ParseUUIDPipe()) variableSymbol2Id: string): Promise<DistinctVariablePairEntity> {
    return this.distinctVariablePairReadService.selectById(systemId, statementId, variableSymbol1Id, variableSymbol2Id);
  }
};
