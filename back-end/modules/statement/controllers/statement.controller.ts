import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { EditStatementPayload } from '@/statement/payloads/edit-statement.payload';
import { NewStatementPayload } from '@/statement/payloads/new-statement.payload';
import { PaginatedStatementsPayload } from '@/statement/payloads/paginated-statements.payload';
import { SearchStatementsPayload } from '@/statement/payloads/search-statements.payload';
import { StatementReadService } from '@/statement/services/statement-read.service';
import { StatementWriteService } from '@/statement/services/statement-write.service';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';

@Controller('system/:systemId/statement')
export class StatementController {
  public constructor(private readonly statementReadService: StatementReadService, private readonly statementWriteService: StatementWriteService) {
  }

  @Delete(':statementId')
  @UseGuards(JwtGuard)
  public deleteStatement(@SessionUser('id') sessionUserId: string, @Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string): Promise<StatementEntity> {
    return this.statementWriteService.delete(sessionUserId, systemId, statementId);
  }

  @Get()
  public getStatements(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Query() searchStatementsPayload: SearchStatementsPayload): Promise<PaginatedStatementsPayload> {
    return this.statementReadService.searchStatements(systemId, searchStatementsPayload);
  }

  @Get(':statementId')
  public getById(@Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string): Promise<StatementEntity> {
    return this.statementReadService.selectById(systemId, statementId);
  }

  @Patch(':statementId')
  @UseGuards(JwtGuard)
  public patchStatement(@SessionUser('id') sessionUserId: string, @Param('systemId', new ParseUUIDPipe()) systemId: string, @Param('statementId', new ParseUUIDPipe()) statementId: string, @Body() editStatementPayload: EditStatementPayload): Promise<StatementEntity> {
    return this.statementWriteService.update(sessionUserId, systemId, statementId, editStatementPayload);
  }

  @Post()
  @UseGuards(JwtGuard)
  public postStatement(@SessionUser('id') sessionUserId: string, @Param('systemId', new ParseUUIDPipe()) systemId: string, @Body() newStatementPayload: NewStatementPayload): Promise<StatementEntity> {
    return this.statementWriteService.create(sessionUserId, systemId, newStatementPayload);
  }
};
