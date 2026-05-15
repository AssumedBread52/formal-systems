import { StatementEntity } from '@/statement/entities/statement.entity';
import { PaginatedStatementsPayload } from '@/statement/payloads/paginated-statements.payload';
import { SearchStatementsPayload } from '@/statement/payloads/search-statements.payload';
import { StatementReadService } from '@/statement/services/statement-read.service';
import { ClassSerializerInterceptor, Controller, Get, Param, ParseUUIDPipe, Query, UseInterceptors, ValidationPipe } from '@nestjs/common';

@Controller('system/:systemId/statement')
export class StatementController {
  public constructor(private readonly statementReadService: StatementReadService) {
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  public getStatements(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Query(new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true })) searchStatementsPayload: SearchStatementsPayload): Promise<PaginatedStatementsPayload> {
    return this.statementReadService.searchStatements(systemId, searchStatementsPayload);
  }

  @Get(':statementId')
  @UseInterceptors(ClassSerializerInterceptor)
  public getById(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string): Promise<StatementEntity> {
    return this.statementReadService.selectById(systemId, statementId);
  }
};
