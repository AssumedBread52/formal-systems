import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { EditStatementPayload } from '@/statement/payloads/edit-statement.payload';
import { NewStatementPayload } from '@/statement/payloads/new-statement.payload';
import { PaginatedStatementsPayload } from '@/statement/payloads/paginated-statements.payload';
import { SearchStatementsPayload } from '@/statement/payloads/search-statements.payload';
import { StatementReadService } from '@/statement/services/statement-read.service';
import { StatementWriteService } from '@/statement/services/statement-write.service';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class StatementResolver {
  public constructor(private readonly statementReadService: StatementReadService, private readonly statementWriteService: StatementWriteService) {
  }

  @Mutation((): typeof StatementEntity => {
    return StatementEntity;
  })
  @UseGuards(JwtGuard)
  public createStatement(@SessionUser('id') sessionUserId: string, @Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('statementPayload') newStatementPayload: NewStatementPayload): Promise<StatementEntity> {
    return this.statementWriteService.create(sessionUserId, systemId, newStatementPayload);
  }

  @Mutation((): typeof StatementEntity => {
    return StatementEntity;
  })
  @UseGuards(JwtGuard)
  public deleteStatement(@SessionUser('id') sessionUserId: string, @Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('statementId', new ParseUUIDPipe()) statementId: string): Promise<StatementEntity> {
    return this.statementWriteService.delete(sessionUserId, systemId, statementId);
  }

  @Query((): typeof StatementEntity => {
    return StatementEntity;
  })
  public statement(@Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('statementId', new ParseUUIDPipe()) statementId: string): Promise<StatementEntity> {
    return this.statementReadService.selectById(systemId, statementId);
  }

  @Query((): typeof PaginatedStatementsPayload => {
    return PaginatedStatementsPayload;
  })
  public statements(@Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('filters') searchStatementsPayload: SearchStatementsPayload): Promise<PaginatedStatementsPayload> {
    return this.statementReadService.searchStatements(systemId, searchStatementsPayload);
  }

  @Mutation((): typeof StatementEntity => {
    return StatementEntity;
  })
  @UseGuards(JwtGuard)
  public updateStatement(@SessionUser('id') sessionUserId: string, @Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('statementId', new ParseUUIDPipe()) statementId: string, @Args('statementPayload') editStatementPayload: EditStatementPayload): Promise<StatementEntity> {
    return this.statementWriteService.update(sessionUserId, systemId, statementId, editStatementPayload);
  }
};
